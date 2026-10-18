import { connectLambda, getStore } from '@netlify/blobs';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
export const SCOPES = 'user-read-currently-playing user-read-recently-played user-top-read';
/** Only this Spotify account can be connected (it's the profile linked on the site). */
export const OWNER_ID = process.env.SPOTIFY_OWNER_ID || '31k76x23j55ygnc4myz53h4j3yma';

type LambdaLike = { blobs?: string; headers?: Record<string, string | undefined> };

/**
 * Why the site can't show a track, sent along with the placeholder so a look at
 * /api/spotify says what to fix:
 *  - not_configured: SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET missing
 *  - not_connected: no refresh token yet; sign in at /api/spotify-login
 *  - reconnect_needed: Spotify rejected the refresh token. They expire six
 *    months after sign-in, so sign in again at /api/spotify-login
 *  - premium_required: Spotify only serves development-mode apps whose owner has Premium
 *  - token_failed_<status> / spotify_<status>: anything else, by HTTP status
 */
export type SpotifyAuth = { token: string } | { error: string };

/**
 * Netlify Blobs from a Lambda-style function: these don't get the blobs context
 * on their own, so use the explicit site ID + token when set (as the guestbook
 * does), else connect the context the event carries.
 */
function store(event?: LambdaLike) {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (siteID && token) return getStore({ name: 'spotify', siteID, token });
  if (event?.blobs) connectLambda(event as { blobs: string; headers: Record<string, string> });
  return getStore('spotify');
}

async function readStoredToken(event?: LambdaLike): Promise<string | null> {
  try {
    return (await store(event).get('refresh_token')) || null;
  } catch (e) {
    console.error('Spotify: could not read the stored refresh token:', e);
    return null;
  }
}

export async function writeStoredToken(event: LambdaLike | undefined, token: string): Promise<void> {
  await store(event).set('refresh_token', token);
}

const basicAuth = () =>
  'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

export const tokenRequest = (params: Record<string, string>) =>
  fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

// a warm function instance keeps its access token until shortly before it expires
let access: { token: string; expires: number } | null = null;

/**
 * An access token from the stored refresh token. The one saved by the sign-in
 * flow (Netlify Blobs) wins; SPOTIFY_REFRESH_TOKEN is the fallback. If Spotify
 * rotates the refresh token, the new one is saved.
 */
export async function getSpotifyAccessToken(event?: LambdaLike): Promise<SpotifyAuth> {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) return { error: 'not_configured' };
  if (access && access.expires > Date.now() + 60_000) return { token: access.token };

  const stored = await readStoredToken(event);
  const candidates = [stored, process.env.SPOTIFY_REFRESH_TOKEN].filter((t, i, all): t is string => !!t && all.indexOf(t) === i);
  if (!candidates.length) return { error: 'not_connected' };

  let error = 'token_failed';
  for (const refresh of candidates) {
    const res = await tokenRequest({ grant_type: 'refresh_token', refresh_token: refresh });
    const data: any = await res.json().catch(() => ({}));
    if (res.ok && data.access_token) {
      access = { token: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 };
      if (data.refresh_token && data.refresh_token !== refresh) {
        await writeStoredToken(event, data.refresh_token).catch((e) => console.error('Spotify: could not save the rotated refresh token:', e));
      }
      return { token: data.access_token };
    }
    console.error('Spotify token refresh failed:', res.status, data.error, data.error_description);
    error = data.error === 'invalid_grant' ? 'reconnect_needed' : `token_failed_${res.status}`;
  }
  return { error };
}

/** A short reason for a failed Web API call. */
export async function apiError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  console.error('Spotify API error:', res.status, text.slice(0, 300));
  if (res.status === 403 && /premium/i.test(text)) return 'premium_required';
  if (res.status === 401) access = null;
  return `spotify_${res.status}`;
}

/* ---------- sign-in flow (see spotify-login.ts / spotify-callback.ts) ---------- */

/** Where Spotify sends the owner back. Register this exact URL in the Spotify app's settings. */
export function redirectUri() {
  return process.env.SPOTIFY_REDIRECT_URI || `${process.env.URL || 'http://localhost:8888'}/api/spotify-callback`;
}

const sign = (payload: string) => createHmac('sha256', process.env.SPOTIFY_CLIENT_SECRET || '').update(payload).digest('base64url');

/** A signed, expiring `state` so a callback can only complete a sign-in this site started. */
export function newState() {
  const payload = `${Date.now()}.${randomUUID()}`;
  return `${payload}.${sign(payload)}`;
}

export function validState(state: string | undefined, maxAgeMs = 10 * 60_000) {
  if (!state) return false;
  const cut = state.lastIndexOf('.');
  const payload = state.slice(0, cut);
  const given = Buffer.from(state.slice(cut + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  return Date.now() - Number(payload.split('.')[0]) < maxAgeMs;
}

/** A tiny HTML page for the sign-in flow's answers. */
export function page(statusCode: number, title: string, message: string) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  return {
    statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    body: `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#05070a;color:#e6f1f5;font:16px/1.6 system-ui,sans-serif">
<main style="max-width:34rem;padding:2rem"><h1 style="font-size:1.4rem">${esc(title)}</h1><p style="color:#9fb3bd">${esc(message)}</p><p><a style="color:#00e5ff" href="/">Back to the site</a></p></main>`,
  };
}
