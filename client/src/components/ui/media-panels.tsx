import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Tv, BookOpen, Eye, Star, CheckCircle2, Clock, CalendarDays,
  PauseCircle, XCircle, List, TrendingUp, ExternalLink, Disc3, Layers,
} from 'lucide-react';
import { profiles, now, music, credit } from '@/lib/personal-data';

const fmt = (n: any, d = 0) => (typeof n === 'number' ? n.toFixed(d) : '—');

/* =====================  SPOTIFY → NIGHT CITY RADIO  ===================== */
interface Track { isPlaying: boolean; title?: string; artist?: string; album?: string; albumImageUrl?: string; songUrl?: string; }
interface Artist { name: string; url: string; image?: string; genres?: string[]; }

/** The song from personal-data, used when Spotify can't be reached. */
function onRepeat() {
  const { title, by } = credit(now.listening);
  return { title, artist: by };
}

/** Stable pseudo-frequency for a song so the needle doesn't jump around. */
function frequencyFor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 88 + (h % 200) / 10; // 88.0 – 107.9
}

export function SpotifyPanel(_: { onMouseMove?: any } = {}) {
  const [track, setTrack] = useState<Track | null>(null);
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [artistsErr, setArtistsErr] = useState(false);

  useEffect(() => {
    let c = false;
    // Cache-bust + no-store so we always get the live track, never a cached one.
    const loadTrack = () =>
      fetch(`/api/spotify?t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: Track) => { if (!c && d && typeof d.isPlaying === 'boolean') setTrack(d); })
        .catch(() => {});
    const loadArtists = () =>
      fetch(`/api/spotify-stats?t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: Artist[]) => { if (c) return; if (Array.isArray(d) && d.length) { setArtists(d); setArtistsErr(false); } else setArtistsErr(true); })
        .catch(() => { if (!c) setArtistsErr(true); });

    loadTrack();
    loadArtists();

    // Poll the now-playing track so it stays close to real time.
    const poll = setInterval(loadTrack, 8000);
    // And refresh the moment the tab is refocused.
    const onVisible = () => { if (document.visibilityState === 'visible') loadTrack(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => { c = true; clearInterval(poll); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const live = !!(track && track.title && track.title !== 'Nothing to show');
  const fallback = onRepeat();
  const title = live ? track!.title! : fallback.title;
  const artist = live ? track!.artist : fallback.artist;
  const playing = !!track?.isPlaying;
  const status = playing ? 'Live right now' : live ? 'Last played' : 'On repeat';
  const freq = frequencyFor(title);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      {/* Tuner */}
      <a
        href={live ? track!.songUrl : now.listeningUrl || profiles.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="shard shard-lg shard-hover group block p-5 md:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${playing ? 'bg-[#1DB954] shadow-[0_0_10px_#1DB954]' : 'bg-primary/50'}`} />
            {status}
          </span>
          <ExternalLink size={16} className="text-muted-foreground transition-colors group-hover:text-primary" />
        </div>

        <div className="mt-5 flex items-center gap-5">
          {live && track?.albumImageUrl ? (
            <img src={track.albumImageUrl} alt={track.album || ''} className="h-24 w-24 shrink-0 object-cover md:h-28 md:w-28 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]" />
          ) : (
            <div className="grid h-24 w-24 shrink-0 place-items-center bg-primary/10 text-primary md:h-28 md:w-28 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
              <Disc3 size={40} className={playing ? 'animate-spin [animation-duration:3s]' : ''} />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-display text-3xl font-bold leading-[1.05] md:text-4xl">{title}</div>
            {artist && <div className="mt-1 text-lg text-muted-foreground">{artist}</div>}
          </div>
        </div>

        {/* Dial: ticks and a needle parked on this song's "frequency" (the live EQ is Chids FM, above) */}
        <div className="mt-7" aria-hidden>
          <div
            className="relative h-7 border-t border-primary/30"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, hsl(2 100% 60% / 0.35) 0 1px, transparent 1px 2.5%)',
              backgroundSize: '100% 8px',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <span className="absolute -top-3 h-6 w-[2px] bg-[var(--nc-yellow)] shadow-[0_0_10px_var(--nc-yellow)]" style={{ left: `${((freq - 88) / 20) * 100}%` }} />
            <div className="absolute inset-x-0 bottom-0 flex justify-between font-mono text-[0.65rem] text-muted-foreground">
              {[88, 92, 96, 100, 104, 108].map((f) => <span key={f}>{f}</span>)}
            </div>
          </div>
          <div className="mt-2 font-mono text-xs text-muted-foreground">
            <span className="text-[var(--nc-yellow)]">{freq.toFixed(1)}</span> Chids FM
          </div>
        </div>
      </a>

      {/* Top artists, or the genres I bounce between if Spotify isn't answering */}
      {artistsErr ? (
        <div className="shard flex flex-col p-5 md:p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-widest">What I listen to</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {music.genres.map((g) => (
              <li key={g} className="nc-chip px-3 py-1.5 text-sm">{g}</li>
            ))}
          </ul>
          <p className="mt-5 text-muted-foreground italic">“{music.note}”</p>
          <a
            href={profiles.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Follow me on Spotify <ExternalLink size={13} />
          </a>
        </div>
      ) : (
        <div className="shard p-5 md:p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-widest">Top artists this month</h3>
          <ol className="mt-4 space-y-1">
            {(artists ?? Array.from({ length: 5 }).map(() => null)).slice(0, 5).map((a, i) =>
              a ? (
                <li key={a.name}>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-1.5">
                    <span className="nc-outline-num w-6 text-2xl">{i + 1}</span>
                    {a.image ? (
                      <img src={a.image} alt="" className="h-11 w-11 shrink-0 object-cover [clip-path:polygon(0_0,calc(100%-7px)_0,100%_7px,100%_100%,7px_100%,0_calc(100%-7px))]" />
                    ) : (
                      <span className="h-11 w-11 shrink-0 bg-muted" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-display text-lg font-semibold leading-tight transition-colors group-hover:text-primary">{a.name}</span>
                      {a.genres?.[0] && <span className="block truncate text-xs text-muted-foreground">{a.genres[0]}</span>}
                    </span>
                  </a>
                </li>
              ) : (
                <li key={i} className="flex items-center gap-4 py-1.5">
                  <span className="w-6" />
                  <span className="h-11 w-11 animate-pulse bg-muted" />
                  <span className="h-4 w-28 animate-pulse bg-muted" />
                </li>
              ),
            )}
          </ol>
        </div>
      )}
    </div>
  );
}

/* =====================  ANIME / MANGA  ===================== */
/** One list entry from /api/mal (netlify/functions/_mal.ts). */
interface Media { id: number; title: string; url: string; image: string | null; type: string; score: number }
interface MalSide { stats: Record<string, number>; top: Media[] }
type Tab = 'anime' | 'manga';

// eight tiles each, so the grid always fills
const animeStatCfg = [
  { k: 'days_watched', label: 'Days watched', icon: Eye, d: 1 },
  { k: 'total_entries', label: 'Total entries', icon: List },
  { k: 'mean_score', label: 'Mean score', icon: Star, d: 2 },
  { k: 'completed', label: 'Completed', icon: CheckCircle2 },
  { k: 'watching', label: 'Watching', icon: Clock },
  { k: 'plan_to_watch', label: 'Plan to watch', icon: CalendarDays },
  { k: 'on_hold', label: 'On hold', icon: PauseCircle },
  { k: 'dropped', label: 'Dropped', icon: XCircle },
  { k: 'episodes_watched', label: 'Episodes', icon: TrendingUp },
];
const mangaStatCfg = [
  { k: 'mean_score', label: 'Mean score', icon: Star, d: 2 },
  { k: 'completed', label: 'Completed', icon: CheckCircle2 },
  { k: 'reading', label: 'Reading', icon: Clock },
  { k: 'plan_to_read', label: 'Plan to read', icon: CalendarDays },
  { k: 'on_hold', label: 'On hold', icon: PauseCircle },
  { k: 'dropped', label: 'Dropped', icon: XCircle },
  { k: 'chapters_read', label: 'Chapters', icon: BookOpen },
  { k: 'volumes_read', label: 'Volumes', icon: Layers },
];

/** Days watched needs episode lengths, which only the official MAL API gives; otherwise show total entries. */
function statTiles(tab: Tab, stat: Record<string, number> | null) {
  if (tab === 'manga') return mangaStatCfg;
  const days = !!stat && 'days_watched' in stat;
  return animeStatCfg.filter((s) => s.k !== (days ? 'total_entries' : 'days_watched'));
}

export function AnimeMangaPanel(_: { onMouseMove?: any } = {}) {
  const [tab, setTab] = useState<Tab>('anime');
  const [mal, setMal] = useState<{ anime: MalSide; manga: MalSide } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let c = false;
    fetch('/api/mal')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!c && d?.anime && d?.manga) setMal(d); else if (!c) setFailed(true); })
      .catch(() => { if (!c) setFailed(true); });
    return () => { c = true; };
  }, []);

  const side = mal?.[tab];
  const stat = side && Object.keys(side.stats).length ? side.stats : null;
  const cfg = statTiles(tab, stat);
  const topList = (side?.top ?? []).slice(0, 4);

  return (
    <div className="shard shard-lg p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Anime or manga" className="flex gap-1.5">
            {(['anime', 'manga'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className="nc-chip px-4 py-1.5 text-sm"
              >
                {t}
              </button>
            ))}
        </div>
        <a
          href={profiles.myanimelist}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          MyAnimeList profile <ExternalLink size={13} />
        </a>
      </div>

      {!stat && (failed || mal) ? (
        <p className="mt-8 text-muted-foreground">
          MyAnimeList isn't answering right now, so the live stats can't load.{' '}
          <a className="text-primary underline underline-offset-4" href={profiles.myanimelist} target="_blank" rel="noopener noreferrer">
            See my list on MAL instead
          </a>
          .
        </p>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <dl className="mt-6 grid grid-cols-2 gap-px bg-primary/10 sm:grid-cols-4">
            {cfg.map((s) => (
              <div key={s.k} className="bg-[hsl(0_45%_5%)] px-4 py-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <s.icon size={12} className="text-primary" /> {s.label}
                </dt>
                <dd className="mt-0.5 font-display text-2xl font-bold tabular-nums">
                  {stat ? fmt(stat[s.k], (s as any).d || 0) : <span className="inline-block h-5 w-10 animate-pulse bg-muted align-middle" />}
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-8 flex items-center gap-2 font-display text-lg font-bold uppercase tracking-widest">
            {tab === 'anime' ? <Tv size={16} className="text-primary" /> : <BookOpen size={16} className="text-primary" />}
            Top rated {tab}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {topList.length
              ? topList.map((m) => (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-[5/7] overflow-hidden [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
                  >
                    {m.image ? (
                      <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-primary/10" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10">
                      <div className="font-display text-base font-semibold leading-tight line-clamp-2">{m.title}</div>
                      <div className="mt-0.5 text-xs text-white/60">{[m.type, m.score ? `★ ${m.score}` : ''].filter(Boolean).join(' · ')}</div>
                    </div>
                  </a>
                ))
              : !mal && Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[5/7] animate-pulse bg-muted" />)}
          </div>
        </motion.div>
      )}
    </div>
  );
}
