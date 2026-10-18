import type { Handler, HandlerResponse } from '@netlify/functions';
import { fetchMal, type MalData } from './_mal';

const USER = 'Champion2049';
const TTL = 15 * 60_000;

// a warm function instance reuses its last answer for a while
let cached: { at: number; data: MalData } | null = null;

export const handler: Handler = async (): Promise<HandlerResponse> => {
  try {
    if (!cached || Date.now() - cached.at > TTL) {
      cached = { at: Date.now(), data: await fetchMal(USER, process.env.MAL_CLIENT_ID) };
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=900, stale-while-revalidate=86400',
      },
      body: JSON.stringify(cached.data),
    };
  } catch (e) {
    console.error('MAL fetch failed:', e);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
    };
  }
};
