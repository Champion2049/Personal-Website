import { Handler } from '@netlify/functions';
import { apiError, getSpotifyAccessToken } from './_spotify';

const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5';
const ok = (body: unknown, reason?: string) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600', ...(reason ? { 'X-Spotify-Reason': reason } : {}) },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  const auth = await getSpotifyAccessToken(event as any);
  if ('error' in auth) return ok([], auth.error);

  try {
    const res = await fetch(TOP_ARTISTS_ENDPOINT, { headers: { Authorization: `Bearer ${auth.token}` } });
    if (res.status !== 200) return ok([], await apiError(res));
    const data = await res.json();
    const artists = (data.items || []).map((artist: any) => ({
      name: artist.name,
      url: artist.external_urls?.spotify,
      image: artist.images?.[0]?.url,
      genres: (artist.genres || []).slice(0, 2),
    }));
    return ok(artists);
  } catch (e) {
    console.error('Spotify request failed:', e);
    return ok([], 'network_error');
  }
};
