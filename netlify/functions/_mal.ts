/**
 * MyAnimeList data for the site, without Jikan (its public API shut down on
 * 1 Oct 2026). Two sources, normalised to one shape:
 *
 *  - the official MAL API v2, when MAL_CLIENT_ID is set (create one at
 *    https://myanimelist.net/apiconfig; a client ID can read public lists);
 *  - otherwise MAL's own list JSON (the data behind a public list page).
 *
 * Stats are computed from the lists. MAL doesn't expose favourites through
 * either, so the panel shows the highest-rated entries instead.
 */

export type MalStatus = 'watching' | 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch' | 'plan_to_read';

export interface MalEntry {
  id: number;
  title: string;
  url: string;
  image: string | null;
  type: string;
  status: MalStatus;
  score: number;
  /** episodes watched / chapters read */
  progress: number;
  /** total episodes / chapters, 0 when unknown */
  total: number;
  updatedAt: string;
}

export interface MalSide {
  stats: Record<string, number>;
  top: MalEntry[];
  recent: MalEntry[];
}

export interface MalData {
  source: 'official' | 'list';
  anime: MalSide;
  manga: MalSide;
}

type Kind = 'anime' | 'manga';

/** An entry plus what the stats need that the cards don't. */
interface Raw extends MalEntry {
  volumes?: number;
  /** seconds per episode, official API only */
  duration?: number;
}

const UA = 'chirayu-portfolio/1.0 (+https://github.com/Champion2049/Personal-Website)';
const LIST_STATUS: Record<Kind, Record<number, MalStatus>> = {
  anime: { 1: 'watching', 2: 'completed', 3: 'on_hold', 4: 'dropped', 6: 'plan_to_watch' },
  manga: { 1: 'reading', 2: 'completed', 3: 'on_hold', 4: 'dropped', 6: 'plan_to_read' },
};

const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);

/** "light_novel" → "Light Novel", "tv" → "TV". */
function typeLabel(t: unknown) {
  const s = String(t || '');
  if (/^(tv|ova|ona)$/i.test(s)) return s.toUpperCase();
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * MAL list thumbnails are resized copies (/r/WxH/…). Drop that for the original
 * path, then ask for the large variant (an "l" before the extension, ~425px wide)
 * so cards aren't upscaled from a 225px image.
 */
function fullImage(src: unknown) {
  if (!src || typeof src !== 'string') return null;
  return src
    .replace(/\/r\/\d+x\d+/, '')
    .replace(/\?.*$/, '')
    .replace(/(\/\d+)(\.\w+)$/, '$1l$2');
}

/** A failed MAL request, with its HTTP status (404 = no such user; 400/401/403 usually a private list). */
export class MalHttpError extends Error {
  constructor(public status: number, host: string) {
    super(`${status} from ${host}`);
  }
}

async function getJson(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', ...headers } });
  if (!res.ok) throw new MalHttpError(res.status, new URL(url).host);
  return res.json();
}

/* ------------------------------ official API ------------------------------ */

async function officialList(user: string, kind: Kind, clientId: string): Promise<Raw[]> {
  const fields =
    kind === 'anime'
      ? 'list_status,num_episodes,average_episode_duration,media_type,main_picture'
      : 'list_status,num_chapters,num_volumes,media_type,main_picture';
  let url: string | undefined =
    `https://api.myanimelist.net/v2/users/${encodeURIComponent(user)}/${kind}list?fields=${fields}&limit=1000&nsfw=true`;
  const out: Raw[] = [];
  for (let page = 0; url && page < 10; page++) {
    const data: any = await getJson(url, { 'X-MAL-CLIENT-ID': clientId });
    for (const { node, list_status: ls } of data.data ?? []) {
      if (!node || !ls) continue;
      out.push({
        id: node.id,
        title: node.title,
        url: `https://myanimelist.net/${kind}/${node.id}`,
        image: node.main_picture?.large || node.main_picture?.medium || null,
        type: typeLabel(node.media_type),
        status: ls.status,
        score: num(ls.score),
        progress: num(kind === 'anime' ? ls.num_episodes_watched : ls.num_chapters_read),
        total: num(kind === 'anime' ? node.num_episodes : node.num_chapters),
        volumes: kind === 'manga' ? num(ls.num_volumes_read) : undefined,
        duration: kind === 'anime' ? num(node.average_episode_duration) : undefined,
        updatedAt: ls.updated_at,
      });
    }
    url = data.paging?.next;
  }
  return out;
}

/* ------------------------------ public list JSON ------------------------------ */

async function publicList(user: string, kind: Kind): Promise<Raw[]> {
  const out: Raw[] = [];
  for (let offset = 0; offset < 3000; offset += 300) {
    const rows: any[] = await getJson(`https://myanimelist.net/${kind}list/${encodeURIComponent(user)}/load.json?status=7&offset=${offset}`);
    if (!Array.isArray(rows)) throw new Error(`unexpected ${kind} list payload`);
    for (const r of rows) {
      const status = LIST_STATUS[kind][num(r.status)];
      if (!status) continue;
      const id = num(r[`${kind}_id`]);
      const path = String(r[`${kind}_url`] || `/${kind}/${id}`);
      const updated = num(r.updated_at);
      out.push({
        id,
        title: String(r[`${kind}_title`] ?? ''),
        url: path.startsWith('http') ? path : `https://myanimelist.net${path}`,
        image: fullImage(r[`${kind}_image_path`]),
        type: typeLabel(r[`${kind}_media_type_string`]),
        status,
        score: num(r.score),
        progress: num(kind === 'anime' ? r.num_watched_episodes : r.num_read_chapters),
        total: num(kind === 'anime' ? r.anime_num_episodes : r.manga_num_chapters),
        volumes: kind === 'manga' ? num(r.num_read_volumes) : undefined,
        updatedAt: new Date(updated > 1e12 ? updated : updated * 1000).toISOString(),
      });
    }
    if (rows.length < 300) break;
  }
  return out;
}

/* ------------------------------ shaping ------------------------------ */

/** An entry without the stats-only fields. */
const strip = ({ volumes: _v, duration: _d, ...e }: Raw): MalEntry => e;

function side(kind: Kind, rows: Raw[]): MalSide {
  const count = (s: MalStatus) => rows.filter((r) => r.status === s).length;
  const scored = rows.filter((r) => r.score > 0);
  const stats: Record<string, number> = {
    mean_score: scored.length ? scored.reduce((a, r) => a + r.score, 0) / scored.length : 0,
    completed: count('completed'),
    on_hold: count('on_hold'),
    dropped: count('dropped'),
    total_entries: rows.length,
  };
  if (kind === 'anime') {
    stats.watching = count('watching');
    stats.plan_to_watch = count('plan_to_watch');
    stats.episodes_watched = rows.reduce((a, r) => a + r.progress, 0);
    // only the official API knows episode lengths
    if (rows.some((r) => r.duration)) {
      stats.days_watched = rows.reduce((a, r) => a + r.progress * (r.duration || 0), 0) / 86400;
    }
  } else {
    stats.reading = count('reading');
    stats.plan_to_read = count('plan_to_read');
    stats.chapters_read = rows.reduce((a, r) => a + r.progress, 0);
    stats.volumes_read = rows.reduce((a, r) => a + (r.volumes || 0), 0);
  }

  const newest = (a: Raw, b: Raw) => +new Date(b.updatedAt) - +new Date(a.updatedAt);
  const top = (scored.length ? [...scored].sort((a, b) => b.score - a.score || newest(a, b)) : rows.filter((r) => r.status === 'completed').sort(newest))
    .slice(0, 8)
    .map(strip);
  const recent = rows
    .filter((r) => !r.status.startsWith('plan_to'))
    .sort(newest)
    .slice(0, 6)
    .map(strip);
  return { stats, top, recent };
}

const empty: MalSide = { stats: {}, top: [], recent: [] };

export async function fetchMal(user: string, clientId?: string): Promise<MalData> {
  const load = async (source: MalData['source']) => {
    const get = (kind: Kind) => (source === 'official' ? officialList(user, kind, clientId!) : publicList(user, kind));
    const [anime, manga] = await Promise.allSettled([get('anime'), get('manga')]);
    if (anime.status === 'rejected' && manga.status === 'rejected') throw anime.reason;
    return {
      source,
      anime: anime.status === 'fulfilled' ? side('anime', anime.value) : empty,
      manga: manga.status === 'fulfilled' ? side('manga', manga.value) : empty,
    };
  };
  if (clientId) {
    try {
      return await load('official');
    } catch (e) {
      console.error('MAL official API failed, trying the public list:', e);
    }
  }
  return load('list');
}

/* ------------------------------ taste match ------------------------------ */

export interface MatchEntry extends MalEntry {
  /** the visitor's score, on titles both lists have */
  theirScore?: number;
}

export interface MatchResult {
  user: string;
  /** MAL-style affinity: the correlation of our scores on titles we've both rated, -100..100; null under 3 */
  affinity: number | null;
  /** titles both lists have (planned ones don't count) */
  shared: number;
  /** of those, how many we've both scored */
  sharedScored: number;
  theirTotal: number;
  /** shared, both scored 8+ */
  bothLoved: MatchEntry[];
  /** my 8+ titles that aren't on their list at all */
  forThem: MatchEntry[];
  /** their 8+ titles that aren't on my list at all */
  forMe: MatchEntry[];
}

/** One anime list: the official API when a client ID is set, else the public list JSON. */
export async function animeList(user: string, clientId?: string): Promise<MalEntry[]> {
  if (clientId) {
    try {
      return (await officialList(user, 'anime', clientId)).map(strip);
    } catch (e) {
      if (e instanceof MalHttpError && e.status === 404) throw e;
      console.error('MAL official API failed, trying the public list:', e);
    }
  }
  return (await publicList(user, 'anime')).map(strip);
}

function pearson(pairs: [number, number][]) {
  const n = pairs.length;
  const mx = pairs.reduce((a, [x]) => a + x, 0) / n;
  const my = pairs.reduce((a, [, y]) => a + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pairs) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}

export function matchTaste(user: string, mine: MalEntry[], theirs: MalEntry[]): MatchResult {
  const seen = (e: MalEntry) => !e.status.startsWith('plan_to');
  const theirById = new Map(theirs.map((e) => [e.id, e]));
  const mineById = new Map(mine.map((e) => [e.id, e]));
  const shared = mine.filter((m) => seen(m) && theirById.has(m.id) && seen(theirById.get(m.id)!));
  const scored = shared.filter((m) => m.score > 0 && theirById.get(m.id)!.score > 0);
  const r = scored.length >= 3 ? pearson(scored.map((m) => [m.score, theirById.get(m.id)!.score])) : null;
  const byScore = (a: MalEntry, b: MalEntry) => b.score - a.score || a.title.localeCompare(b.title);

  return {
    user,
    affinity: r === null ? null : Math.round(r * 1000) / 10,
    shared: shared.length,
    sharedScored: scored.length,
    theirTotal: theirs.filter(seen).length,
    bothLoved: scored
      .filter((m) => m.score >= 8 && theirById.get(m.id)!.score >= 8)
      .map((m) => ({ ...m, theirScore: theirById.get(m.id)!.score }))
      .sort((a, b) => b.score + b.theirScore! - (a.score + a.theirScore!) || a.title.localeCompare(b.title))
      .slice(0, 6),
    forThem: mine.filter((m) => m.score >= 8 && !theirById.has(m.id)).sort(byScore).slice(0, 6),
    forMe: theirs.filter((t) => t.score >= 8 && !mineById.has(t.id)).sort(byScore).slice(0, 6),
  };
}
