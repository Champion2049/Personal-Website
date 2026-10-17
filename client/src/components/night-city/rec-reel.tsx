import { useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { movies, tvShows, favouriteGame, gamesILike } from '@/lib/personal-data';

type Kind = 'film' | 'series' | 'game';
interface Pick { title: string; cover?: string; rating?: number; note?: string; year?: string }

const POOLS: Record<Kind, Pick[]> = {
  film: movies,
  series: tvShows,
  game: [favouriteGame, ...gamesILike],
};
const KINDS: { id: Kind; label: string; verb: string }[] = [
  { id: 'film', label: 'Film', verb: 'watch' },
  { id: 'series', label: 'Series', verb: 'binge' },
  { id: 'game', label: 'Game', verb: 'play' },
];
const ROW = 64; // px — must match the reel row height below
const SPINS = 22;

const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

/**
 * "Can't decide?" — spins a reel through my own lists and lands on one,
 * with my score and note. A rare, user-triggered moment, so it gets a beat.
 */
export function RecReel() {
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<Kind>('film');
  const [reel, setReel] = useState<Pick[]>(() => [POOLS.film[0]]);
  const [result, setResult] = useState<Pick | null>(null);
  const [spinning, setSpinning] = useState(false);
  const y = useMotionValue(0);
  const last = useRef<string | null>(null);

  const spin = () => {
    if (spinning) return;
    const pool = POOLS[kind];
    const choices = pool.filter((p) => p.title !== last.current);
    const target = choices[Math.floor(Math.random() * choices.length)];
    last.current = target.title;

    if (reduce) {
      setReel([target]);
      y.set(0);
      setResult(target);
      return;
    }

    const filler: Pick[] = [];
    while (filler.length < SPINS) filler.push(...shuffle(pool));
    const strip = [reel[reel.length - 1] ?? target, ...filler.slice(0, SPINS), target];
    setReel(strip);
    setResult(null);
    setSpinning(true);
    y.set(0);
    animate(y, -(strip.length - 1) * ROW, {
      duration: 1.7,
      ease: [0.15, 0.85, 0.25, 1],
      onComplete: () => {
        setSpinning(false);
        setResult(target);
      },
    });
  };

  const verb = KINDS.find((k) => k.id === kind)!.verb;

  return (
    <div className="shard shard-lg grid grid-cols-1 gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div>
        <p className="max-w-md text-lg text-muted-foreground">
          Can't decide what to {verb} tonight? I'll pick from my own lists, so at least you know someone vouches for it.
        </p>

        <div role="group" aria-label="What should I pick?" className="mt-5 flex gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k.id}
              aria-pressed={kind === k.id}
              disabled={spinning}
              onClick={() => setKind(k.id)}
              className="nc-chip px-4 py-1.5 text-sm"
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-stretch gap-3">
          <div
            className="relative flex-1 overflow-hidden border-y border-primary/30 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
            style={{ height: ROW }}
            aria-hidden
          >
            <motion.ul style={{ y }}>
              {reel.map((p, i) => (
                <li key={i} className="flex items-center px-3 font-display text-2xl font-bold uppercase leading-none tracking-wide" style={{ height: ROW }}>
                  <span className="truncate">{p.title}</span>
                </li>
              ))}
            </motion.ul>
            <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-[var(--nc-yellow)]" />
          </div>
          <button onClick={spin} disabled={spinning} className="nc-btn shrink-0 px-5">
            <Shuffle size={16} /> {result ? 'Again' : 'Pick'}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {result ? `Picked ${result.title}${result.rating != null ? `, rated ${result.rating} out of 10` : ''}.` : ''}
        </p>
      </div>

      {/* Result */}
      <div className="min-h-[168px]">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={result.title}
              className="flex gap-5"
              initial={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              {result.cover && (
                <img
                  src={result.cover}
                  alt=""
                  className="h-40 w-28 shrink-0 object-cover [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Tonight, {verb}:</p>
                <h3 className="mt-1 font-display text-3xl font-bold uppercase leading-[0.95] md:text-4xl">{result.title}</h3>
                {result.rating != null && (
                  <p className="mt-3 font-display text-lg">
                    I'd give it <span className="font-bold text-[var(--nc-yellow)]">{result.rating.toFixed(1)}</span> / 10
                  </p>
                )}
                {result.note && <p className="mt-2 text-sm italic text-muted-foreground">“{result.note}”</p>}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="grid h-full min-h-[168px] place-items-center border border-dashed border-primary/25 p-6 text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              {spinning ? 'Rolling…' : 'Your pick lands here.'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
