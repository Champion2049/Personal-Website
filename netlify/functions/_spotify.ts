import { getStore } from '@netlify/blobs';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

export function spotifyConfigured(): boolean {
  return !!(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET &&
    process.env.SPOTIFY_REFRESH_TOKEN
  );
}

async function readStoredToken(): Promise<string | null> {
  try {
    const store = getStore('spotify');
    return (await store.get('refresh_token')) || null;
  } catch {
    return null;
  }
}

async function writeStoredToken(token: string): Promise<void> {
  try {
    const store = getStore('spotify');
    await store.set('refresh_token', token);
  } catch {
    /* blobs unavailable (e.g. local without netlify dev) — ignore */
  }
}

/**
 * Exchanges a refresh token for an access token. Spotify can rotate the refresh
 * token; when it does we persist the new one to Netlify Blobs so it never goes
 * stale. We prefer the rotated token in Blobs and fall back to the env token.
 */
export async function getSpotifyAccessToken(): Promise<string | null> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const exchange = (refreshToken: string) =>
    fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });

  const stored = await readStoredToken();
  let activeToken = stored || SPOTIFY_REFRESH_TOKEN;

  let res = await exchange(activeToken);

  // If a previously-rotated token went stale, fall back to the env token once.
  if (!res.ok && stored && stored !== SPOTIFY_REFRESH_TOKEN) {
    activeToken = SPOTIFY_REFRESH_TOKEN;
    res = await exchange(activeToken);
  }

  if (!res.ok) return null;

  const data: any = await res.json();
  // Persist a rotated refresh token so future calls keep working automatically.
  if (data.refresh_token && data.refresh_token !== activeToken) {
    await writeStoredToken(data.refresh_token);
  }
  return data.access_token || null;
}
