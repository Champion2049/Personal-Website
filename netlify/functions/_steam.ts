/**
 * What I'm playing on Steam, from the Steam Web API. Needs STEAM_API_KEY
 * (https://steamcommunity.com/dev/apikey) and STEAM_ID: the 17-digit SteamID64,
 * or the custom name from steamcommunity.com/id/<name>. The profile and its
 * "game details" have to be public.
 */

export interface SteamGame {
  appid: number;
  name: string;
  /** store header art (460×215) */
  image: string;
  /** hours in the last two weeks (recent games only) */
  hours2w?: number;
  /** hours all time */
  hours: number;
  url: string;
}

export interface SteamData {
  profile: { name: string; url: string; avatar: string };
  /** 'in-game' beats the presence states */
  status: 'in-game' | 'online' | 'away' | 'offline';
  inGame: SteamGame | null;
  recent: SteamGame[];
  library: { games: number; hours: number; mostPlayed: SteamGame[] } | null;
}

export class SteamError extends Error {
  constructor(public reason: 'not_configured' | 'unknown_user' | 'private_profile' | 'unavailable', detail = '') {
    super(detail || reason);
  }
}

const API = 'https://api.steampowered.com';
const hours = (minutes = 0) => Math.round((minutes / 60) * 10) / 10;
const storeUrl = (appid: number) => `https://store.steampowered.com/app/${appid}`;
const fallbackImage = (appid: number) => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;

async function get(path: string, params: Record<string, string | number>) {
  const url = `${API}/${path}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`;
  const res = await fetch(url);
  if (res.status === 401 || res.status === 403) throw new SteamError('not_configured', `Steam rejected the API key (${res.status})`);
  if (!res.ok) throw new SteamError('unavailable', `${res.status} from Steam`);
  return (await res.json())?.response ?? {};
}

async function steamId(key: string, id: string) {
  if (/^\d{17}$/.test(id)) return id;
  const r = await get('ISteamUser/ResolveVanityURL/v1/', { key, vanityurl: id });
  if (r.success !== 1 || !r.steamid) throw new SteamError('unknown_user', `no Steam user "${id}"`);
  return r.steamid as string;
}

// header art never changes, so a warm instance keeps what it has looked up
const art = new Map<number, string>();

/** Store header images: the exact URL from the store when it answers in time, else the usual path. */
async function headers(appids: number[]) {
  await Promise.all(
    appids
      .filter((id) => !art.has(id))
      .map(async (id) => {
        try {
          const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&filters=basic`, { signal: AbortSignal.timeout(2500) });
          const img = (await res.json())?.[id]?.data?.header_image;
          if (img) art.set(id, img);
        } catch {
          /* fall back to the usual path */
        }
      }),
  );
  return (id: number) => art.get(id) || fallbackImage(id);
}

export async function fetchSteam(key?: string, id?: string): Promise<SteamData> {
  if (!key || !id) throw new SteamError('not_configured');
  const steamid = await steamId(key, id.trim());

  const [summary, recentRes, ownedRes] = await Promise.all([
    get('ISteamUser/GetPlayerSummaries/v2/', { key, steamids: steamid }),
    get('IPlayerService/GetRecentlyPlayedGames/v1/', { key, steamid, count: 6 }),
    get('IPlayerService/GetOwnedGames/v1/', { key, steamid, include_appinfo: 1, include_played_free_games: 1 }),
  ]);
  const player = summary.players?.[0];
  if (!player) throw new SteamError('unknown_user', `no Steam user ${steamid}`);
  // a private profile (or private game details) answers with empty game lists
  if (player.communityvisibilitystate !== 3 || (!recentRes.games && !ownedRes.games)) throw new SteamError('private_profile');

  const owned: any[] = ownedRes.games ?? [];
  const recentRaw: any[] = (recentRes.games ?? []).slice(0, 4);
  const mostRaw = [...owned].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 3);
  const inGameId = player.gameid ? Number(player.gameid) : null;

  const ids = [...recentRaw, ...mostRaw].map((g) => g.appid as number).concat(inGameId ? [inGameId] : []);
  const image = await headers(ids.filter((id, i) => ids.indexOf(id) === i));
  const game = (g: any): SteamGame => ({
    appid: g.appid,
    name: g.name,
    image: image(g.appid),
    hours: hours(g.playtime_forever),
    ...(g.playtime_2weeks != null ? { hours2w: hours(g.playtime_2weeks) } : {}),
    url: storeUrl(g.appid),
  });

  const ownedMatch = inGameId ? owned.find((g) => g.appid === inGameId) : null;
  return {
    profile: { name: player.personaname, url: player.profileurl, avatar: player.avatarfull },
    status: inGameId ? 'in-game' : player.personastate === 0 ? 'offline' : player.personastate === 1 ? 'online' : 'away',
    inGame: inGameId
      ? game({ appid: inGameId, name: player.gameextrainfo || ownedMatch?.name || 'a game', playtime_forever: ownedMatch?.playtime_forever ?? 0 })
      : null,
    recent: recentRaw.map(game),
    library: ownedRes.game_count
      ? { games: ownedRes.game_count, hours: hours(owned.reduce((a, g) => a + (g.playtime_forever || 0), 0)), mostPlayed: mostRaw.map(game) }
      : null,
  };
}
