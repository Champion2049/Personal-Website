import type { Handler } from '@netlify/functions';
import { SCOPES, newState, page, redirectUri } from './_spotify';

/**
 * Starts the owner's Spotify sign-in. Visit /api/spotify-login when the site
 * stops showing tracks: Spotify refresh tokens now expire six months after
 * sign-in. The callback only accepts the owner's account.
 */
export const handler: Handler = async () => {
  const id = process.env.SPOTIFY_CLIENT_ID;
  if (!id || !process.env.SPOTIFY_CLIENT_SECRET) {
    return page(500, 'Spotify isn’t set up', 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to the Netlify environment variables, then try again.');
  }
  const url = new URL('https://accounts.spotify.com/authorize');
  url.search = new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SCOPES,
    state: newState(),
    show_dialog: 'true',
  }).toString();
  return { statusCode: 302, headers: { Location: url.toString(), 'Cache-Control': 'no-store' }, body: '' };
};
