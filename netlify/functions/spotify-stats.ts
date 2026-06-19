import { Handler } from '@netlify/functions';
import { getSpotifyAccessToken, spotifyConfigured } from './_spotify';

const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5';
const ok = (body: unknown) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const handler: Handler = async () => {
  if (!spotifyConfigured()) return ok([]);

  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) return ok([]);

  try {
    const res = await fetch(TOP_ARTISTS_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.status !== 200) return ok([]);
    const data = await res.json();
    const artists = (data.items || []).map((artist: any) => ({
      name: artist.name,
      url: artist.external_urls.spotify,
      image: artist.images?.[0]?.url,
      genres: (artist.genres || []).slice(0, 2),
    }));
    return ok(artists);
  } catch {
    return ok([]);
  }
};
