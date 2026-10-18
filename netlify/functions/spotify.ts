import { Handler } from '@netlify/functions';
import { apiError, getSpotifyAccessToken } from './_spotify';

const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

const auth = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });
const ok = (body: unknown) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});
/** The placeholder the site falls back from, with why (see SpotifyAuth in _spotify.ts). */
const nothing = (reason: string) => ok({ isPlaying: false, title: 'Nothing to show', reason });

const shape = (track: any, isPlaying: boolean) => ({
  album: track.album?.name,
  albumImageUrl: track.album?.images?.[0]?.url,
  artist: (track.artists ?? []).map((a: any) => a.name).join(', '),
  isPlaying,
  songUrl: track.external_urls?.spotify,
  title: track.name,
});

export const handler: Handler = async (event) => {
  const creds = await getSpotifyAccessToken(event as any);
  if ('error' in creds) return nothing(creds.error);

  try {
    const nowPlaying = await fetch(NOW_PLAYING_ENDPOINT, { headers: auth(creds.token) });
    if (nowPlaying.status === 200) {
      const song = await nowPlaying.json();
      // Accept the track even when paused — Spotify's recently-played feed lags
      // (it only logs fully-played songs and omits the active one), so the
      // current/paused track is the most accurate "what I'm on right now".
      if (song?.item) return ok(shape(song.item, !!song.is_playing));
    } else if (nowPlaying.status !== 204) {
      return nothing(await apiError(nowPlaying));
    }

    const recent = await fetch(RECENTLY_PLAYED_ENDPOINT, { headers: auth(creds.token) });
    if (recent.status !== 200) return nothing(await apiError(recent));
    const lastSong = (await recent.json()).items?.[0]?.track;
    return lastSong ? ok(shape(lastSong, false)) : nothing('no_history');
  } catch (e) {
    console.error('Spotify request failed:', e);
    return nothing('network_error');
  }
};
