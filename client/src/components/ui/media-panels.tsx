import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Music2, Tv, BookOpen, Eye, Star, CheckCircle2, Clock, CalendarDays,
  PauseCircle, XCircle, List, Rewind, TrendingUp, ExternalLink, Disc3, Layers,
} from 'lucide-react';
import { profiles } from '@/lib/personal-data';

const MAL_USER = 'Champion2049';
const fmt = (n: any, d = 0) => (typeof n === 'number' ? n.toFixed(d) : '—');

/* =====================  SPOTIFY  ===================== */
interface Track { isPlaying: boolean; title?: string; artist?: string; album?: string; albumImageUrl?: string; songUrl?: string; }
interface Artist { name: string; url: string; image?: string; genres?: string[]; }

export function SpotifyPanel({ onMouseMove }: { onMouseMove?: any }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [trackErr, setTrackErr] = useState(false);
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [artistsErr, setArtistsErr] = useState(false);

  useEffect(() => {
    let c = false;
    // Cache-bust + no-store so we always get the live track, never a cached one.
    const loadTrack = () =>
      fetch(`/api/spotify?t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: Track) => { if (c) return; if (d && typeof d.isPlaying === 'boolean') { setTrack(d); setTrackErr(false); } else setTrackErr(true); })
        .catch(() => { if (!c) setTrackErr(true); });
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

  const hasTrack = !!(track && track.title && track.title !== 'Nothing to show');

  return (
    <div className="space-y-5">
      {/* Now playing */}
      <a href={hasTrack ? track!.songUrl : profiles.spotify} target="_blank" rel="noopener noreferrer"
        onMouseMove={onMouseMove} className="card-spotlight panel relative p-5 flex items-center justify-center gap-5 group">
        <div className="relative shrink-0">
          {hasTrack && track?.albumImageUrl ? (
            <img src={track.albumImageUrl} alt={track.album || ''} className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <div className="grid place-items-center h-20 w-20 rounded-lg" style={{ background: '#1DB95422', color: '#1DB954' }}>
              <Disc3 size={30} className={hasTrack ? 'animate-spin' : ''} />
            </div>
          )}
          {track?.isPlaying && (
            <span className="absolute -bottom-1 -right-1 flex h-5 items-end gap-0.5 rounded-full bg-black/70 px-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="w-0.5 h-full bg-green-400" style={{ transformOrigin: 'bottom' }}
                  animate={{ scaleY: [0.3, 1, 0.5, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </span>
          )}
        </div>
        <div className="min-w-0 max-w-[18rem] text-center">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            {track?.isPlaying ? 'Now playing' : hasTrack ? 'Last listened' : 'Spotify'}
          </div>
          {hasTrack ? (
            <>
              <div className="font-space text-lg font-semibold truncate">{track!.title}</div>
              <div className="text-sm text-muted-foreground truncate">{track!.artist}</div>
            </>
          ) : (
            <>
              <div className="font-space text-lg font-semibold">{trackErr ? 'Spotify offline' : 'My rotation'}</div>
              <div className="text-sm text-muted-foreground">
                {trackErr ? 'Live track appears once the API is connected' : 'Synthwave, OSTs & everything between'}
              </div>
            </>
          )}
        </div>
        <ExternalLink size={16} className="absolute top-4 right-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </a>

      {/* Top artists */}
      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Music2 size={16} className="text-primary" />
          <h4 className="font-space font-semibold">Top artists this month</h4>
        </div>
        {artists ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {artists.slice(0, 5).map((a) => (
              <a key={a.name} href={a.url} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col items-center text-center">
                {a.image ? (
                  <img src={a.image} alt={a.name} className="h-16 w-16 rounded-full object-cover ring-1 ring-border group-hover:ring-primary/60 transition" />
                ) : (
                  <div className="grid place-items-center h-16 w-16 rounded-full bg-muted"><Music2 size={20} /></div>
                )}
                <span className="mt-2 text-xs font-medium truncate w-full group-hover:text-primary transition-colors">{a.name}</span>
                {a.genres?.[0] && <span className="font-mono text-[0.6rem] text-muted-foreground truncate w-full">{a.genres[0]}</span>}
              </a>
            ))}
          </div>
        ) : artistsErr ? (
          <p className="text-sm text-muted-foreground">Top artists appear once the Spotify API is connected.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-12 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================  ANIME / MANGA  ===================== */
interface Media { mal_id: number; title: string; url: string; images: { jpg: { image_url: string } }; type: string; }
type Tab = 'anime' | 'manga';

const animeStatCfg = [
  { k: 'days_watched', label: 'Days Watched', icon: Eye, d: 1 },
  { k: 'mean_score', label: 'Mean Score', icon: Star, d: 2 },
  { k: 'completed', label: 'Completed', icon: CheckCircle2 },
  { k: 'watching', label: 'Watching', icon: Clock },
  { k: 'plan_to_watch', label: 'Plan to Watch', icon: CalendarDays },
  { k: 'on_hold', label: 'On Hold', icon: PauseCircle },
  { k: 'dropped', label: 'Dropped', icon: XCircle },
  { k: 'total_entries', label: 'Total Entries', icon: List },
  { k: 'rewatched', label: 'Rewatched', icon: Rewind },
  { k: 'episodes_watched', label: 'Episodes', icon: TrendingUp },
];
const mangaStatCfg = [
  { k: 'days_read', label: 'Days Read', icon: Eye, d: 1 },
  { k: 'mean_score', label: 'Mean Score', icon: Star, d: 2 },
  { k: 'completed', label: 'Completed', icon: CheckCircle2 },
  { k: 'reading', label: 'Reading', icon: Clock },
  { k: 'plan_to_read', label: 'Plan to Read', icon: CalendarDays },
  { k: 'on_hold', label: 'On Hold', icon: PauseCircle },
  { k: 'dropped', label: 'Dropped', icon: XCircle },
  { k: 'total_entries', label: 'Total Entries', icon: List },
  { k: 'reread', label: 'Reread', icon: Rewind },
  { k: 'chapters_read', label: 'Chapters', icon: BookOpen },
  { k: 'volumes_read', label: 'Volumes', icon: Layers },
];

export function AnimeMangaPanel({ onMouseMove }: { onMouseMove?: any }) {
  const [tab, setTab] = useState<Tab>('anime');
  const [stats, setStats] = useState<{ anime?: any; manga?: any } | null>(null);
  const [favs, setFavs] = useState<{ anime: Media[]; manga: Media[] } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let c = false;
    Promise.all([
      fetch(`https://api.jikan.moe/v4/users/${MAL_USER}/full`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`https://api.jikan.moe/v4/users/${MAL_USER}/favorites`).then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([full, favorites]) => {
        if (c) return;
        setStats(full?.data?.statistics ?? null);
        setFavs({ anime: favorites?.data?.anime ?? [], manga: favorites?.data?.manga ?? [] });
      })
      .catch(() => { if (!c) setFailed(true); });
    return () => { c = true; };
  }, []);

  const cfg = tab === 'anime' ? animeStatCfg : mangaStatCfg;
  const stat = stats ? stats[tab] : null;
  const favList = (favs ? favs[tab] : []).slice(0, 4);

  return (
    <div onMouseMove={onMouseMove} className="card-spotlight panel p-6">
      {/* toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full border border-border p-1 bg-background/40">
          {(['anime', 'manga'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {failed && !stat ? (
        <p className="text-center text-sm text-muted-foreground py-4">
          Couldn’t reach MyAnimeList right now. <a className="text-primary" href={profiles.myanimelist} target="_blank" rel="noopener noreferrer">Open my profile →</a>
        </p>
      ) : (
        <>
          {/* stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {cfg.map((s) => (
              <div key={s.k} className="rounded-xl border border-border p-3 flex items-center gap-3">
                <s.icon size={18} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground truncate">{s.label}</div>
                  <div className="font-space text-lg font-bold leading-tight">
                    {stat ? fmt(stat[s.k], (s as any).d || 0) : <span className="inline-block h-4 w-8 rounded bg-muted animate-pulse" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* favorites */}
          <div className="flex items-center gap-2 mb-3">
            {tab === 'anime' ? <Tv size={16} className="text-primary" /> : <BookOpen size={16} className="text-primary" />}
            <h4 className="font-space font-semibold capitalize">Top {tab}</h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {favList.length
              ? favList.map((m) => (
                  <a key={m.mal_id} href={m.url} target="_blank" rel="noopener noreferrer"
                    className="group flex overflow-hidden rounded-xl border border-border hover:border-primary/40 transition-colors">
                    <img src={m.images.jpg.image_url} alt={m.title} className="w-16 object-cover" loading="lazy" />
                    <div className="flex flex-col justify-between p-3 flex-1 min-w-0">
                      <h5 className="font-space text-sm font-semibold leading-snug text-primary line-clamp-2">{m.title}</h5>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-[0.65rem] text-muted-foreground">{m.type}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/90 text-black px-2 py-0.5 text-[0.6rem] font-semibold">
                          <Star size={10} /> Favorite
                        </span>
                      </div>
                    </div>
                  </a>
                ))
              : Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>

          <div className="mt-5 text-center">
            <a href={profiles.myanimelist} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm transition-colors hover:border-primary/50 hover:text-primary">
              View MAL profile <ExternalLink size={14} />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
