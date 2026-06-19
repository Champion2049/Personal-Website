import { Handler } from '@netlify/functions';
import { getSpotifyAccessToken, spotifyConfigured } from './_spotify';

const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

const auth = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });
const ok = (body: unknown) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const handler: Handler = async () => {
  if (!spotifyConfigured()) {
    return ok({ isPlaying: false, title: 'Nothing to show' });
  }

  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    // Token exchange failed (expired/revoked refresh token) — degrade gracefully.
    return ok({ isPlaying: false, title: 'Nothing to show' });
  }

  try {
    const nowPlayingResponse = await fetch(NOW_PLAYING_ENDPOINT, { headers: auth(accessToken) });
    if (nowPlayingResponse.status === 200) {
      const song = await nowPlayingResponse.json();
      // Accept the track even when paused — Spotify's recently-played feed lags
      // (it only logs fully-played songs and omits the active one), so the
      // current/paused track is the most accurate "what I'm on right now".
      if (song && song.item) {
        return ok({
          album: song.item.album.name,
          albumImageUrl: song.item.album.images[0]?.url,
          artist: song.item.artists.map((a: any) => a.name).join(', '),
          isPlaying: !!song.is_playing,
          songUrl: song.item.external_urls.spotify,
          title: song.item.name,
        });
      }
    }

    const recentlyPlayedResponse = await fetch(RECENTLY_PLAYED_ENDPOINT, { headers: auth(accessToken) });
    if (recentlyPlayedResponse.status !== 200) return ok({ isPlaying: false, title: 'Nothing to show' });

    const recentlyPlayed = await recentlyPlayedResponse.json();
    const lastSong = recentlyPlayed.items?.[0]?.track;
    if (!lastSong) return ok({ isPlaying: false, title: 'Nothing to show' });

    return ok({
      album: lastSong.album.name,
      albumImageUrl: lastSong.album.images[0]?.url,
      artist: lastSong.artists.map((a: any) => a.name).join(', '),
      isPlaying: false,
      songUrl: lastSong.external_urls.spotify,
      title: lastSong.name,
    });
  } catch {
    return ok({ isPlaying: false, title: 'Nothing to show' });
  }
};
