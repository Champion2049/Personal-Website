import type { Handler, HandlerResponse } from '@netlify/functions';
import { SteamError, fetchSteam, type SteamData } from './_steam';

const TTL = 60_000;
let cached: { at: number; data: SteamData } | null = null;

/** GET /api/steam: my Steam status, recent games and library totals, or { reason } when there's nothing to show. */
export const handler: Handler = async (): Promise<HandlerResponse> => {
  try {
    if (!cached || Date.now() - cached.at > TTL) {
      cached = { at: Date.now(), data: await fetchSteam(process.env.STEAM_API_KEY, process.env.STEAM_ID) };
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=120, stale-while-revalidate=600',
      },
      body: JSON.stringify(cached.data),
    };
  } catch (e) {
    const reason = e instanceof SteamError ? e.reason : 'unavailable';
    if (reason !== 'not_configured') console.error('Steam:', e);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ reason }),
    };
  }
};
