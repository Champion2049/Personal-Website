import { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { favouriteGame, gamesILike, wantToPlay, type GameItem } from '@/lib/personal-data';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { TiltCard } from './tilt-card';

type Open = (src: string, title: string) => void;
type Sort = 'mine' | 'rating' | 'az';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'mine', label: 'My order' },
  { id: 'rating', label: 'Top rated' },
  { id: 'az', label: 'A–Z' },
];

const CHAMFER = '[clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))]';

function Cover({ game, onOpen, caption = true }: { game: GameItem; onOpen: Open; caption?: boolean }) {
  const [err, setErr] = useState(false);
  const hasImg = !!(game.cover && !err);
  const body = (
    <TiltCard className={`aspect-[3/4] overflow-hidden bg-muted ${CHAMFER}`}>
      {hasImg ? (
        <img src={game.cover} alt="" onError={() => setErr(true)} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/20 to-transparent p-3 text-center font-display text-sm font-semibold">
          {game.title}
        </span>
      )}
      {game.rating != null && (
        <span className="absolute right-0 top-0 z-[11] inline-flex items-center gap-1 bg-black/80 py-1 pl-2.5 pr-4 font-display text-sm font-bold tabular-nums text-[var(--nc-yellow)] [clip-path:polygon(0_0,100%_0,100%_100%,8px_100%,0_calc(100%-8px))]">
          {game.rating.toFixed(1)}
        </span>
      )}
      {caption && (
        <span className="absolute inset-x-0 bottom-0 z-[11] bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2.5 pt-8 text-left">
          <span className="block font-display text-sm font-semibold leading-tight text-white line-clamp-2">{game.title}</span>
        </span>
      )}
    </TiltCard>
  );
  if (!hasImg) return body;
  return (
    <button
      data-lock
      onClick={() => onOpen(game.cover!, game.title)}
      aria-label={`${game.title}, view cover`}
      className="block w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nc-yellow)]"
    >
      {body}
    </button>
  );
}

function CrownedFavourite({ onOpen }: { onOpen: Open }) {
  const g = favouriteGame;
  const tags = (g.tags ?? []).filter((t) => !/all-time/i.test(t));
  const root = useRef<HTMLDivElement>(null);

  // The cover swings round to face you. (The blurred key art stays put: moving a blurred layer re-filters it every frame.)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        root.current!.querySelector('[data-cover]'),
        { rotateY: -32, rotateZ: -4, transformPerspective: 900 },
        { rotateY: 0, rotateZ: 0, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'center 55%', scrub: 0.6 } },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="shard shard-lg shard-gold relative isolate overflow-hidden">
      {g.cover && (
        <img aria-hidden src={g.cover} alt="" className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-35 blur-2xl" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[hsl(225_45%_4%)] via-[hsl(225_45%_4%/0.85)] to-transparent" />
      <div className="grid grid-cols-1 items-center gap-8 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:p-10">
        <div>
          <span className="nc-chip nc-chip-gold inline-flex items-center gap-1.5">
            <Crown size={13} /> All-time #1
          </span>
          <h3
            data-text={g.title}
            className="nc-glitch nc-glitch-hover mt-5 block font-display text-5xl font-bold uppercase leading-[0.88] md:text-7xl"
          >
            {g.title}
          </h3>
          {g.note && <p className="mt-4 font-display text-xl font-medium italic text-[var(--nc-yellow)]">“{g.note}”</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {g.rating != null && (
              <span className="inline-flex items-baseline gap-1 font-display">
                <span className="text-4xl font-bold tabular-nums">{g.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 10</span>
              </span>
            )}
            <span className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="nc-chip">{t}</span>
              ))}
            </span>
          </div>
        </div>
        {g.cover && (
          <div data-cover className="w-44 justify-self-center md:w-56">
            <Cover game={{ ...g, rating: undefined }} onOpen={onOpen} caption={false} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Deals the covers: as the grid scrolls in they fly out of one skewed pile in
 * the middle of the grid to their slots, top card first. Scrubbed, so scrolling
 * back up gathers them into the pile again.
 */
function useDeal(grid: React.RefObject<HTMLUListElement>, deps: unknown[]) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Offsets depend on the column count, so rebuild when a breakpoint changes it.
      const mm = gsap.matchMedia();
      mm.add({ any: '(min-width: 0px)', sm: '(min-width: 640px)', lg: '(min-width: 1024px)' }, () => {
        const ul = grid.current!;
        const cards = gsap.utils.toArray<HTMLElement>('[data-deal]', ul);
        const pileX = ul.clientWidth / 2;
        const pileY = Math.min(ul.clientHeight, window.innerHeight * 0.6) / 2;
        const tl = gsap.timeline({ scrollTrigger: { trigger: ul, start: 'top 85%', end: 'top 25%', scrub: 0.7 } });
        // top of the pile (the last card) goes first; offsetLeft/Top ignore transforms
        cards.forEach((el, i) => {
          const li = el.parentElement!;
          tl.fromTo(
            el,
            {
              x: pileX - (li.offsetLeft + li.offsetWidth / 2),
              y: pileY - (li.offsetTop + li.offsetHeight / 2),
              rotation: gsap.utils.random(-16, 16),
              scale: 0.78,
            },
            { x: 0, y: 0, rotation: 0, scale: 1, ease: 'power2.inOut', duration: 1, immediateRender: true },
            (cards.length - 1 - i) * 0.12,
          );
        });
      });
    },
    { scope: grid, dependencies: deps, revertOnUpdate: true },
  );
}

export function GameLibrary({ onOpen }: { onOpen: Open }) {
  const reduce = useReducedMotion();
  const [sort, setSort] = useState<Sort>('mine');
  const sorted = useMemo(() => {
    if (sort === 'rating') return [...gamesILike].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === 'az') return [...gamesILike].sort((a, b) => a.title.localeCompare(b.title));
    return gamesILike;
  }, [sort]);
  const grid = useRef<HTMLUListElement>(null);
  useDeal(grid, [sort]);

  return (
    <>
      <CrownedFavourite onOpen={onOpen} />

      <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
        <h3 className="font-display text-2xl font-bold uppercase tracking-wider">
          Played and loved <span className="text-muted-foreground">{gamesILike.length}</span>
        </h3>
        <div role="group" aria-label="Sort games" className="flex gap-1.5">
          {SORTS.map((s) => (
            <button key={s.id} aria-pressed={sort === s.id} onClick={() => setSort(s.id)} className="nc-chip">
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <ul ref={grid} className="relative mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {sorted.map((g) => (
          <motion.li
            key={g.title}
            layout={!reduce}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.12 }}
          >
            <div data-deal>
              <Cover game={g} onOpen={onOpen} />
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="mt-14 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-2xl font-bold uppercase tracking-wider">
          Backlog <span className="text-muted-foreground">{wantToPlay.length}</span>
        </h3>
        <p className="text-sm text-muted-foreground">Haven't played these yet. They're next.</p>
      </div>
      <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {wantToPlay.map((g) => (
          <li key={g.title} className="nc-backlog">
            <Cover game={g} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </>
  );
}

export const gamesMeta = `${gamesILike.length + 1} played, ${wantToPlay.length} in the backlog`;
