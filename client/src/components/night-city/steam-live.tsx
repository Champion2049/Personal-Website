import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';

/** /api/steam's answer (netlify/functions/_steam.ts, SteamData), or { reason } when there's nothing to show. */
export interface SteamGame { appid: number; name: string; image: string; hours2w?: number; hours: number; url: string }
export interface SteamData {
  profile: { name: string; url: string; avatar: string };
  status: 'in-game' | 'online' | 'away' | 'offline';
  inGame: SteamGame | null;
  recent: SteamGame[];
  library: { games: number; hours: number; mostPlayed: SteamGame[] } | null;
}

/** Live Steam data, refreshed every couple of minutes; null when Steam isn't set up or the profile is private. */
export function useSteam() {
  const q = useQuery<SteamData | { reason: string }>({
    queryKey: ['/api/steam'],
    queryFn: () => fetch('/api/steam').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  return q.data && 'profile' in q.data ? q.data : null;
}

const fmtHours = (h: number) => (h >= 100 ? Math.round(h).toLocaleString('en-GB') : h.toLocaleString('en-GB', { maximumFractionDigits: 1 }));

/** Store header art; a game without it gets a plain tile with its name. */
function Art({ game, className = '' }: { game: SteamGame; className?: string }) {
  const [broken, setBroken] = useState(false);
  return broken ? (
    <div className={`grid place-items-center bg-primary/10 p-3 text-center font-display text-lg font-bold uppercase ${className}`}>{game.name}</div>
  ) : (
    <img src={game.image} alt="" loading="lazy" onError={() => setBroken(true)} className={`object-cover ${className}`} />
  );
}

const STATUS = { 'in-game': 'In game right now', online: 'Online on Steam', away: 'Away on Steam', offline: 'Offline' } as const;

/** The top of the Games section: what I'm playing on Steam right now and lately. Renders nothing until Steam answers. */
export function SteamLive() {
  const steam = useSteam();
  if (!steam || (!steam.inGame && !steam.recent.length && !steam.library)) return null;
  const { inGame, recent, library } = steam;
  const live = steam.status === 'in-game';
  const lately = recent.filter((g) => g.appid !== inGame?.appid);

  return (
    <div className="shard shard-lg mb-14 p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${live ? 'bg-[var(--nc-cyan)] shadow-[0_0_10px_var(--nc-cyan)]' : steam.status === 'offline' ? 'bg-primary/40' : 'bg-[var(--nc-yellow)]'}`} />
          {STATUS[steam.status]}
        </span>
        <a href={steam.profile.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
          Steam profile <ExternalLink size={13} />
        </a>
      </div>

      {inGame && (
        <a href={inGame.url} target="_blank" rel="noopener noreferrer" className="group mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-[minmax(0,20rem)_1fr]">
          <Art game={inGame} className="aspect-[460/215] w-full" />
          <div>
            <div className="font-display text-3xl font-bold uppercase leading-none transition-colors group-hover:text-[var(--nc-yellow)] md:text-4xl">{inGame.name}</div>
            {inGame.hours > 0 && <div className="mt-2 text-muted-foreground">{fmtHours(inGame.hours)} hours in, and counting</div>}
          </div>
        </a>
      )}

      {lately.length > 0 && (
        <>
          <h3 className="mt-7 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Last two weeks</h3>
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {lately.slice(0, 4).map((g) => (
              <li key={g.appid}>
                <a href={g.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <Art game={g} className="aspect-[460/215] w-full" />
                  <div className="mt-2 truncate font-display text-base font-semibold leading-tight transition-colors group-hover:text-[var(--nc-yellow)]">{g.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {fmtHours(g.hours2w ?? 0)} h lately · {fmtHours(g.hours)} h total
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {library && (
        <p className="mt-6 border-t border-primary/15 pt-4 text-sm text-muted-foreground">
          <span className="text-foreground tabular-nums">{library.games.toLocaleString('en-GB')}</span> games on Steam,{' '}
          <span className="text-foreground tabular-nums">{fmtHours(library.hours)}</span> hours played
          {library.mostPlayed[0] && (
            <>
              . Most played: <span className="text-foreground">{library.mostPlayed[0].name}</span> ({fmtHours(library.mostPlayed[0].hours)} h)
            </>
          )}
          .
        </p>
      )}
    </div>
  );
}
