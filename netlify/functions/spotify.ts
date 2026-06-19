import { Handler } from '@netlify/functions';
<<<<<<< HEAD
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
=======

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN
} = process.env;

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;

const getAccessToken = async () => {
    const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN!,
        }),
    });

    return response.json();
};

const getNowPlaying = async (accessToken: string) => {
    return fetch(NOW_PLAYING_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

const getRecentlyPlayed = async (accessToken: string) => {
    return fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

export const handler: Handler = async () => {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing required Spotify environment variables.' }),
        };
    }

    const { access_token } = await getAccessToken();

    if (!access_token) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve access token.' }),
        };
    }

    const nowPlayingResponse = await getNowPlaying(access_token);

    if (nowPlayingResponse.status === 200) {
        const song = await nowPlayingResponse.json();
        if (song && song.is_playing) {
            const isPlaying = song.is_playing;
            const title = song.item.name;
            const artist = song.item.artists.map((_artist: any) => _artist.name).join(', ');
            const album = song.item.album.name;
            const albumImageUrl = song.item.album.images[0].url;
            const songUrl = song.item.external_urls.spotify;

            return {
                statusCode: 200,
                body: JSON.stringify({
                    album,
                    albumImageUrl,
                    artist,
                    isPlaying,
                    songUrl,
                    title,
                }),
            };
        }
    }

    // If not currently playing, or if the response was 204, get the last played song
    const recentlyPlayedResponse = await getRecentlyPlayed(access_token);

    if (recentlyPlayedResponse.status !== 200) {
        return {
            statusCode: 200,
            body: JSON.stringify({ isPlaying: false, title: "Nothing to show" }),
        };
    }

    const recentlyPlayed = await recentlyPlayedResponse.json();
    if (!recentlyPlayed.items || recentlyPlayed.items.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({ isPlaying: false, title: "Nothing to show" }),
        };
    }

    const lastSong = recentlyPlayed.items[0].track;
    const title = lastSong.name;
    const artist = lastSong.artists.map((_artist: any) => _artist.name).join(', ');
    const album = lastSong.album.name;
    const albumImageUrl = lastSong.album.images[0].url;
    const songUrl = lastSong.external_urls.spotify;

    return {
        statusCode: 200,
        body: JSON.stringify({
            album,
            albumImageUrl,
            artist,
            isPlaying: false,
            songUrl,
            title,
        }),
    };
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
};
