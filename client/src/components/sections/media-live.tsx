import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music2, ExternalLink, Disc3, Tv, Star, CheckCircle, Eye, CalendarClock } from 'lucide-react';
import { useSpotlight } from '@/lib/use-spotlight';
import { profiles } from '@/lib/personal-data';

const MAL_USER = 'Champion2049';

/* ----------------------------- Spotify ----------------------------- */
interface NowPlaying {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

export function SpotifyNow() {
  const { onMouseMove } = useSpotlight();
  const [data, setData] = useState<NowPlaying | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/spotify')
      .then((r) => {
        const ct = r.headers.get('content-type') || '';
        if (!r.ok || !ct.includes('application/json')) throw new Error('no api');
        return r.json();
      })
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  const href = data?.songUrl || profiles.spotify;

  return (
    <motion.a
      href={href} target="_blank" rel="noopener noreferrer" onMouseMove={onMouseMove}
      className="card-spotlight panel p-5 flex items-center gap-4 group"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
    >
      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden grid place-items-center" style={{ background: '#1DB95422' }}>
        {data?.albumImageUrl ? (
          <img src={data.albumImageUrl} alt={data.album || ''} className="h-full w-full object-cover" />
        ) : (
          <Music2 size={26} style={{ color: '#1DB954' }} />
        )}
        {data?.isPlaying && (
          <span className="absolute bottom-1 right-1 flex items-end gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="w-0.5 rounded-full bg-white"
                animate={{ height: [3, 9, 3] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          <Disc3 size={12} className="text-primary" />
          {data ? (data.isPlaying ? 'Now playing' : 'Last played') : 'Spotify'}
        </div>
        {data?.title ? (
          <>
            <div className="font-space font-semibold truncate">{data.title}</div>
            <div className="text-sm text-muted-foreground truncate">{data.artist}</div>
          </>
        ) : (
          <>
            <div className="font-space font-semibold">Spotify</div>
            <div className="text-sm text-muted-foreground truncate">
              {failed ? 'My profile & playlists' : 'Connecting…'}
            </div>
          </>
        )}
      </div>
      <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
    </motion.a>
  );
}

/* ----------------------------- MyAnimeList (Jikan) ----------------------------- */
interface MalAnime { mal_id: number; title: string; url: string; images: { jpg: { image_url: string } }; }
interface MalStats { days_watched: number; mean_score: number; completed: number; watching: number; total_entries: number; }

export function MalPanel() {
  const { onMouseMove } = useSpotlight();
  const [stats, setStats] = useState<MalStats | null>(null);
  const [faves, setFaves] = useState<MalAnime[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [s, f] = await Promise.all([
          fetch(`https://api.jikan.moe/v4/users/${MAL_USER}/statistics`).then((r) => r.json()),
          fetch(`https://api.jikan.moe/v4/users/${MAL_USER}/favorites`).then((r) => r.json()),
        ]);
        if (cancelled) return;
        if (s?.data?.anime) setStats(s.data.anime);
        if (f?.data?.anime) setFaves(f.data.anime.slice(0, 6));
        if (!s?.data?.anime && !f?.data?.anime) setFailed(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const statCards = stats ? [
    { icon: Eye, label: 'Days', value: stats.days_watched?.toFixed(1) },
    { icon: Star, label: 'Mean', value: stats.mean_score?.toFixed(2) },
    { icon: CheckCircle, label: 'Completed', value: stats.completed },
    { icon: Tv, label: 'Watching', value: stats.watching },
  ] : [];

  return (
    <motion.div
      onMouseMove={onMouseMove}
      className="card-spotlight panel p-6"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-xl" style={{ background: '#2e51a222', color: '#7a92d6' }}>
            <Tv size={18} />
          </div>
          <div>
            <h3 className="font-space font-semibold leading-tight">MyAnimeList</h3>
            <p className="font-mono text-xs text-muted-foreground">@{MAL_USER}</p>
          </div>
        </div>
        <a href={profiles.myanimelist} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:gap-2 transition-all">
          Profile <ExternalLink size={13} />
        </a>
      </div>

      {stats ? (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-lg border border-border p-3 text-center">
              <s.icon size={15} className="text-primary mx-auto mb-1.5" />
              <div className="font-space text-lg font-bold leading-none">{s.value ?? '—'}</div>
              <div className="font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <CalendarClock size={12} /> Favourite anime
      </p>
      {faves.length ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {faves.map((a) => (
            <a key={a.mal_id} href={a.url} target="_blank" rel="noopener noreferrer"
              className="group relative aspect-[3/4] rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors" title={a.title}>
              <img src={a.images.jpg.image_url} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <span className="text-[0.6rem] leading-tight line-clamp-3">{a.title}</span>
              </div>
            </a>
          ))}
        </div>
      ) : failed ? (
        <p className="text-sm text-muted-foreground">
          Couldn't reach MyAnimeList right now — check it out <a className="text-primary" href={profiles.myanimelist} target="_blank" rel="noopener noreferrer">directly</a>.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      )}
    </motion.div>
  );
}
