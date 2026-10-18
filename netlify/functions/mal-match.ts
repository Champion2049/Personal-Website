import type { Handler, HandlerResponse } from '@netlify/functions';
import { MalHttpError, animeList, matchTaste, type MalEntry } from './_mal';

const ME = 'Champion2049';
const TTL = 30 * 60_000;
/** MAL usernames: 2–16 letters, digits, _ or - */
const VALID = /^[A-Za-z0-9_-]{2,16}$/;

// warm-instance caches: my list, and the last few visitors' lists
const lists = new Map<string, { at: number; list: MalEntry[] }>();

async function list(user: string) {
  const key = user.toLowerCase();
  const hit = lists.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.list;
  const fresh = await animeList(user, process.env.MAL_CLIENT_ID);
  if (lists.size > 50) lists.delete(lists.keys().next().value!);
  lists.set(key, { at: Date.now(), list: fresh });
  return fresh;
}

const reply = (statusCode: number, body: unknown, cache = false): HandlerResponse => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...(cache
      ? { 'Cache-Control': 'public, max-age=600', 'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=1800', 'Netlify-Vary': 'query=user' }
      : { 'Cache-Control': 'no-store' }),
  },
  body: JSON.stringify(body),
});

/** GET /api/mal-match?user=<MAL username>: how close their anime taste is to mine. */
export const handler: Handler = async (event) => {
  const user = (event.queryStringParameters?.user || '').trim();
  if (!VALID.test(user)) return reply(400, { error: 'invalid_user' });

  let mine: MalEntry[];
  try {
    mine = await list(ME);
  } catch (e) {
    console.error('MAL: my list failed:', e);
    return reply(502, { error: 'unavailable' });
  }
  try {
    return reply(200, matchTaste(user, mine, await list(user)), true);
  } catch (e) {
    if (e instanceof MalHttpError && e.status === 404) return reply(404, { error: 'not_found' });
    if (e instanceof MalHttpError && e.status < 500) return reply(403, { error: 'private_or_missing' });
    console.error(`MAL: ${user}'s list failed:`, e);
    return reply(502, { error: 'unavailable' });
  }
};
