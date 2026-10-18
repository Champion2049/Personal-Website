import { useRef, useState } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { useLenis } from '@/components/ui/lenis-scroll-provider';
import type { Project } from '@/lib/projects-data';
import { CaseVisual } from './case-visual';

/**
 * The featured projects as case files, picked one at a time. On desktop the
 * files sit side by side on a pinned stage: scrolling slides the deck along,
 * and when you stop it settles on the next (or previous) file in the
 * direction you scrolled, so each scroll moves exactly one card. The selector
 * above jumps straight to a file. Nothing scales; the cards off to the side
 * dim and hold a still frame. On small screens, and with reduced motion,
 * they're a plain stacked list. Each file has a live, code-drawn visual.
 */
/** Scroll held at each end of the stage, in cards. */
const HOLD = 0.1;

export function CaseFiles({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const deck = useRef<ScrollTrigger | null>(null);
  const lenis = useLenis();
  // only the file in front animates its visual
  const [active, setActive] = useState(0);
  const n = projects.length;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-file]', track.current);
        const steps = cards.length - 1;
        const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
        // a short hold at each end keeps the first and last files inside the pinned range, so
        // settling on them doesn't sit exactly on the trigger's start/end line
        const tl = gsap.timeline({ defaults: { ease: 'none' } }).to({}, { duration: HOLD });
        for (let i = 1; i <= steps; i++) tl.to(track.current, { x: () => -step() * i, duration: 1 });
        tl.to({}, { duration: HOLD });
        const span = steps + 2 * HOLD;
        const fileAt = (progress: number) => progress * span - HOLD; // 0..steps
        // the first stop after scrolling into the stage lands on the file at that end
        let entry: 'start' | 'end' | null = null;
        deck.current = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 72px',
          end: () => `+=${span * window.innerHeight * 0.75}`,
          pin: true,
          scrub: 0.35,
          animation: tl,
          invalidateOnRefresh: true,
          onEnter: () => (entry = 'start'),
          onEnterBack: () => (entry = 'end'),
          onLeave: () => (entry = null),
          onLeaveBack: () => (entry = null),
          // when you stop, settle on the next file in the direction you were scrolling (a small
          // dead zone keeps the one you're on if you barely moved). Coming in from either end,
          // the first stop is that end's file unless you scrolled most of a card past it.
          snap: {
            snapTo: (v, self) => {
              const raw = fileAt(v);
              const lo = Math.floor(raw);
              const hi = Math.ceil(raw);
              const down = (self?.direction ?? 1) > 0;
              let i = down ? (raw - lo < 0.12 ? lo : hi) : hi - raw < 0.12 ? hi : lo;
              if (entry === 'start' && raw < 0.85) i = 0;
              if (entry === 'end' && steps - raw < 0.85) i = steps;
              entry = null;
              return (gsap.utils.clamp(0, steps, i) + HOLD) / span;
            },
            duration: { min: 0.25, max: 0.55 },
            delay: 0.04,
            ease: 'power2.inOut',
          },
          onUpdate: (self) => setActive(gsap.utils.clamp(0, steps, Math.round(fileAt(self.progress)))),
        });
        return () => {
          deck.current = null;
        };
      });

      // stacked list: the file on screen runs its visual
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray<HTMLElement>('[data-file]', track.current).forEach((card, i) => {
          ScrollTrigger.create({ trigger: card, start: 'top 70%', end: 'bottom 30%', onToggle: (self) => self.isActive && setActive(i) });
        });
      });
    },
    { scope: root },
  );

  /** Selector: scroll to where file i sits in the pinned stage. */
  const pick = (i: number) => {
    const st = deck.current;
    if (!st) {
      root.current?.querySelectorAll<HTMLElement>('[data-file]')[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const y = st.start + (st.end - st.start) * ((i + HOLD) / (n - 1 + 2 * HOLD));
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div ref={root} className="lg:flex lg:h-[calc(100svh-72px)] lg:flex-col lg:pb-6">
      <div role="tablist" aria-label="Case files" className="mb-6 hidden flex-wrap gap-x-8 gap-y-2 lg:flex">
        {projects.map((p, i) => (
          <button
            key={p.title}
            role="tab"
            aria-selected={active === i}
            onClick={() => pick(i)}
            className={`relative pb-2 text-sm transition-colors ${active === i ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <span className="mr-2 font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
            {p.caseFile!.short}
            <span aria-hidden className={`absolute inset-x-0 -bottom-px h-px origin-left bg-primary transition-transform duration-300 ${active === i ? 'scale-x-100' : 'scale-x-0'}`} />
          </button>
        ))}
      </div>

      <div ref={track} className="space-y-8 lg:flex lg:min-h-0 lg:flex-1 lg:gap-8 lg:space-y-0">
        {projects.map((p, i) => {
          const f = p.caseFile!;
          const front = active === i;
          return (
            <article
              key={p.title}
              data-file
              className={`lg:h-full lg:w-[86%] lg:shrink-0 lg:transition-opacity lg:duration-500 ${front ? '' : 'lg:pointer-events-none lg:opacity-[0.35]'}`}
            >
              <div className="panel relative h-full overflow-hidden bg-background">
                <div className="grid h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                  <div className="flex flex-col p-6 md:p-10">
                    <p className="text-sm text-muted-foreground">
                      {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {p.category} · {p.period}
                    </p>
                    <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-[0.95] tracking-tight md:text-5xl">{p.title}</h3>
                    <p className="mt-4 text-xl leading-snug text-foreground/90">{f.summary}</p>
                    <dl className="mt-8 space-y-4">
                      {(
                        [
                          ['Problem', f.problem],
                          ['Approach', f.approach],
                          ['Result', f.result],
                        ] as const
                      ).map(([k, v]) => (
                        <div key={k} className="grid gap-1 md:grid-cols-[6.5rem_1fr] md:gap-4">
                          <dt className="text-sm text-primary">{k}</dt>
                          <dd className="leading-relaxed text-muted-foreground">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
                      <p className="text-sm text-foreground/70">{p.tags.join('  ·  ')}</p>
                      <a href={p.github} target="_blank" rel="noopener noreferrer" tabIndex={front ? undefined : -1} className="btn-hud btn-hud-ghost group">
                        <Github size={15} /> Source
                        <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </div>
                  <div className="relative order-first aspect-video border-b border-[var(--line)] bg-[hsl(216_33%_4%)] lg:order-none lg:aspect-auto lg:border-b-0 lg:border-l">
                    <CaseVisual kind={f.visual} running={front} className="absolute inset-0" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
