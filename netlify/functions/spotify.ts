import { Handler } from '@netlify/functions';

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
};
