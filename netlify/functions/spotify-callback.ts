import type { Handler } from '@netlify/functions';
import { OWNER_ID, page, redirectUri, tokenRequest, validState, writeStoredToken } from './_spotify';

/** Finishes the owner's Spotify sign-in and saves the refresh token to Netlify Blobs. */
export const handler: Handler = async (event) => {
  const q = event.queryStringParameters || {};
  if (q.error) return page(400, 'Spotify sign-in cancelled', `Spotify answered: ${q.error}.`);
  if (!q.code || !validState(q.state)) {
    return page(400, 'Sign-in link expired', 'Start again from /api/spotify-login.');
  }

  const res = await tokenRequest({ grant_type: 'authorization_code', code: q.code, redirect_uri: redirectUri() });
  const tokens: any = await res.json().catch(() => ({}));
  if (!res.ok || !tokens.refresh_token) {
    return page(502, 'Spotify didn’t hand over a token', tokens.error_description || tokens.error || `HTTP ${res.status}`);
  }

  // only the owner's account may drive what the site shows
  const me = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  const profile: any = await me.json().catch(() => ({}));
  if (!me.ok) {
    const why = profile?.error?.message || `HTTP ${me.status}`;
    return page(502, 'Couldn’t read the Spotify profile', /premium/i.test(why) ? `${why}. Spotify now requires the app owner to have Premium.` : why);
  }
  if (profile.id !== OWNER_ID) {
    return page(403, 'Wrong account', 'Only the site owner’s Spotify account can be connected here.');
  }

  try {
    await writeStoredToken(event as any, tokens.refresh_token);
  } catch (e) {
    console.error('Spotify: could not save the refresh token:', e);
    return page(500, 'Signed in, but the token wasn’t saved', 'Netlify Blobs refused the write. Check the function logs.');
  }

  const renew = new Date(Date.now() + 182 * 86400_000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return page(200, 'Spotify is connected', `The site will show what you’re playing again. Spotify expires this sign-in after six months, so come back to /api/spotify-login before ${renew}.`);
};
