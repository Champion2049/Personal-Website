import { useRef, useState } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import type { Project } from '@/lib/projects-data';
import { CaseVisual } from './case-visual';

/**
 * The featured projects as case files: each gets a full-screen moment. On
 * desktop they're sticky and stack, so the next file slides up over the
 * current one while it settles back (scale + dim, scrubbed). On small screens
 * they're a plain stacked list. Each file has a live, code-drawn visual.
 */
export function CaseFiles({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null);
  // only the file in front animates its visual; the ones it covers hold a still frame
  const [front, setFront] = useState(0);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>('[data-file]', root.current);
      // which file is in front (all widths): from the moment it starts sliding in until the next one does.
      // Handing over early means the file being scaled back is already a still frame; scaling a layer
      // while its canvas animates forces it to be redrawn every frame.
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        ScrollTrigger.create({
          trigger: card,
          start: 'top bottom',
          ...(next ? { endTrigger: next, end: 'top bottom' } : { end: 'bottom top' }),
          onToggle: (self) => self.isActive && setFront(i),
        });
      });
      // desktop: the file underneath settles back as the next one slides over it
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          const st = { trigger: next, start: 'top bottom', end: 'top 88px', scrub: true };
          gsap.to(card.querySelector('[data-file-body]'), { scale: 0.92, ease: 'none', scrollTrigger: st });
          gsap.to(card.querySelector('[data-file-dim]'), { opacity: 0.65, ease: 'none', scrollTrigger: st });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="space-y-8 lg:space-y-[18vh]">
      {projects.map((p, i) => {
        const f = p.caseFile!;
        return (
          <article key={p.title} data-file className="lg:sticky lg:top-[88px]">
            <div data-file-body className="panel relative origin-top overflow-hidden bg-background lg:h-[calc(100svh-120px)]">
              <div className="grid h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div className="flex flex-col p-6 md:p-10">
                  <p className="text-sm text-muted-foreground">
                    {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} · {p.category} · {p.period}
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
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn-hud btn-hud-ghost group">
                      <Github size={15} /> Source
                      <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
                <div className="relative order-first aspect-video border-b border-[var(--line)] bg-[hsl(216_33%_4%)] lg:order-none lg:aspect-auto lg:border-b-0 lg:border-l">
                  {/* on desktop a covered file hides its canvas: scaling a layer with a canvas in it is expensive, and the next file covers it anyway */}
                  <CaseVisual kind={f.visual} running={front === i} className={`absolute inset-0 ${front === i ? '' : 'lg:invisible'}`} />
                </div>
              </div>
              <div data-file-dim aria-hidden className="pointer-events-none absolute inset-0 bg-background opacity-0" />
            </div>
          </article>
        );
      })}
    </div>
  );
}
