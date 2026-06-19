import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music2, Tv, ExternalLink, Radio } from 'lucide-react';
import { profiles } from '@/lib/personal-data';

const MAL_USER = 'Champion2049';

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

interface AnimeStats {
  days_watched?: number;
  mean_score?: number;
  completed?: number;
  watching?: number;
  total_entries?: number;
  episodes_watched?: number;
}

function Equalizer() {
  return (
    <div className="flex items-end gap-0.5 h-4" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-0.5 bg-green-400"
          animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
          style={{ height: '30%' }}
        />
      ))}
    </div>
  );
}

export function SpotifyCard({ onMouseMove }: { onMouseMove?: any }) {
  const [data, setData] = useState<SpotifyData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/spotify')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: SpotifyData) => { if (!cancelled && d && typeof d.isPlaying === 'boolean') setData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const hasTrack = !!(data && data.title && data.title !== 'Nothing to show');
  const href = data?.songUrl || profiles.spotify;
  const live = data?.isPlaying;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onMouseMove={onMouseMove}
      className="card-spotlight panel p-5 flex items-center gap-4 group">
      <div className="relative shrink-0">
        {hasTrack && data?.albumImageUrl ? (
          <img src={data.albumImageUrl} alt={data.album || ''} className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <div className="grid place-items-center h-16 w-16 rounded-lg" style={{ background: '#1DB95422', color: '#1DB954' }}>
            <Music2 size={26} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            {live ? 'Now playing' : hasTrack ? 'Last played' : 'Spotify'}
          </span>
          {live && <Equalizer />}
        </div>
        {hasTrack ? (
          <>
            <div className="font-space font-semibold truncate">{data!.title}</div>
            <div className="text-sm text-muted-foreground truncate">{data!.artist}</div>
          </>
        ) : (
          <>
            <div className="font-space font-semibold">My rotation</div>
            <div className="text-sm text-muted-foreground truncate">Synthwave, OSTs &amp; everything in between</div>
          </>
        )}
      </div>
      <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}

export function MalCard({ onMouseMove }: { onMouseMove?: any }) {
  const [stats, setStats] = useState<AnimeStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Jikan is a public, CORS-enabled API — fetch straight from the browser.
    fetch(`https://api.jikan.moe/v4/users/${MAL_USER}/statistics`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: any) => {
        if (cancelled) return;
        const anime = d?.data?.anime;
        if (anime) setStats(anime); else setFailed(true);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  const metrics = stats
    ? [
        { label: 'Completed', value: stats.completed ?? '—' },
        { label: 'Watching', value: stats.watching ?? '—' },
        { label: 'Mean', value: stats.mean_score ?? '—' },
        { label: 'Days', value: stats.days_watched != null ? Math.round(stats.days_watched) : '—' },
      ]
    : [];

  return (
    <a href={profiles.myanimelist} target="_blank" rel="noopener noreferrer" onMouseMove={onMouseMove}
      className="card-spotlight panel p-5 group sm:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-3 mb-3">
        <div className="grid place-items-center h-11 w-11 rounded-xl shrink-0" style={{ background: '#2e51a233', color: '#7d9be6' }}>
          <Tv size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-space font-semibold">MyAnimeList</div>
          <div className="text-sm text-muted-foreground truncate">
            {stats ? 'Live anime stats' : failed ? 'What I’m watching' : 'Loading stats…'}
          </div>
        </div>
        <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      {stats ? (
        <div className="grid grid-cols-4 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="text-center rounded-lg border border-border py-2">
              <div className="font-space text-lg font-bold accent-text">{m.value}</div>
              <div className="font-mono text-[0.58rem] uppercase tracking-wide text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      ) : !failed ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Radio size={13} className="animate-pulse text-primary" /> fetching from Jikan…
        </div>
      ) : null}
    </a>
  );
}
