import { Handler } from '@netlify/functions';

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN
} = process.env;

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const TOP_ARTISTS_ENDPOINT = `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5`;

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

const getTopArtists = async (accessToken: string) => {
    return fetch(TOP_ARTISTS_ENDPOINT, {
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

    const topArtistsResponse = await getTopArtists(access_token);

    if (topArtistsResponse.status !== 200) {
        const errorBody = await topArtistsResponse.text();
        return {
            statusCode: topArtistsResponse.status,
            body: JSON.stringify({ error: 'Failed to fetch top artists.', details: errorBody }),
        };
    }

    const topArtists = await topArtistsResponse.json();

    const artists = topArtists.items.map((artist: any) => ({
        name: artist.name,
        url: artist.external_urls.spotify,
        image: artist.images[0]?.url,
        genres: artist.genres.slice(0, 2), // Get first 2 genres
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(artists),
    };
};
