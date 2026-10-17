import { useRef, useState } from 'react';
import { movies, tvShows, type RankItem } from '@/lib/personal-data';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

type Open = (src: string, title: string) => void;

function Row({ item, rank, onOpen }: { item: RankItem; rank: number; onOpen: Open }) {
  const [err, setErr] = useState(false);
  const hasImg = !!(item.cover && !err);
  const inner = (
    <>
      {hasImg && (
        <img
          src={item.cover}
          alt=""
          loading="lazy"
          onError={() => setErr(true)}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30 transition-opacity duration-300 group-hover:opacity-55"
        />
      )}
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[hsl(0_45%_4%)] via-[hsl(0_45%_4%/0.8)] to-[hsl(0_45%_4%/0.35)]" />
      <span className="nc-outline-num w-14 shrink-0 self-center text-center text-6xl md:w-16 md:text-7xl">{rank}</span>
      <span className="block min-w-0 flex-1 py-4">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-display text-xl font-bold leading-tight">{item.title}</span>
          {item.year && <span className="shrink-0 text-xs text-muted-foreground">{item.year}</span>}
        </span>
        {item.note && <span className="mt-1 block text-sm italic leading-snug text-white/70 line-clamp-2">“{item.note}”</span>}
      </span>
      {item.rating != null && (
        <span className="shrink-0 self-start pr-5 pt-4 font-display text-xl font-bold tabular-nums text-[var(--nc-yellow)]">
          {item.rating.toFixed(1)}
        </span>
      )}
    </>
  );
  const cls = 'shard shard-sm shard-hover group relative isolate flex min-h-[104px] w-full items-stretch gap-3 overflow-hidden text-left';
  return (
    <li data-row>
      {hasImg ? (
        <button onClick={() => onOpen(item.cover!, item.title)} className={`${cls} cursor-zoom-in`} aria-label={`${item.title}, view poster`}>
          {inner}
        </button>
      ) : (
        <div className={cls}>{inner}</div>
      )}
    </li>
  );
}

function RankList({ title, items, onOpen }: { title: string; items: RankItem[]; onOpen: Open }) {
  return (
    <div data-list>
      <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-wider">{title}</h3>
      <ol className="space-y-3">
        {items.map((m, i) => (
          <Row key={m.title} item={m} rank={i + 1} onOpen={onOpen} />
        ))}
      </ol>
    </div>
  );
}

/** Films slide in from the left, series from the right, leaning into the move; scrubbed per row. */
export function Screenings({ onOpen }: { onOpen: Open }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>('[data-list]', root.current).forEach((list, side) => {
        const dir = side === 0 ? -1 : 1;
        list.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
          gsap.fromTo(
            row,
            { xPercent: dir * 18, skewX: dir * -10, autoAlpha: 0 },
            { xPercent: 0, skewX: 0, autoAlpha: 1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 98%', end: 'top 72%', scrub: 0.5 } },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
      <RankList title="Films" items={movies} onOpen={onOpen} />
      <RankList title="Series" items={tvShows} onOpen={onOpen} />
    </div>
  );
}
