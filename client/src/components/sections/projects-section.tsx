import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useLenis } from '@/components/ui/lenis-scroll-provider';
import { projectsData, type Category, type Project } from '@/lib/projects-data';
import { CaseFiles } from './case-files';

const caseFiles = projectsData.filter((p) => p.caseFile);
// everything without a case file goes in the gallery below them
const others = projectsData.filter((p) => !p.caseFile);

const filters: ('All' | Category)[] = ['All', 'AI / ML', 'Signals & Hardware', 'Web & Systems', 'Research'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Large screens with motion allowed get the pinned horizontal gallery; everything else keeps the grid. */
function useGalleryMode() {
  const query = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setOn(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return on;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm text-muted-foreground">
          {project.category} · {project.period}
          {project.featured && <span className="text-primary"> · Featured</span>}
        </p>
        <h3 className="mt-3 font-display text-xl font-bold uppercase leading-snug tracking-wide transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{project.description}</p>
        <p className="mt-5 text-sm text-foreground/70">{project.tags.join('  ·  ')}</p>
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="group/link flex items-center justify-between border-t border-[var(--line)] px-6 py-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <span className="inline-flex items-center gap-2"><Github size={15} /> Source</span>
        <ArrowUpRight size={16} className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
      </a>
    </>
  );
}

/**
 * Pinned horizontal gallery: vertical scroll drives the track sideways, the
 * track leans into fast scrolling (velocity skew) and each card swings in as it
 * crosses the right edge. Transform-only; rebuilt whenever the filter changes.
 */
function Gallery({ items, active, filtersBar }: { items: Project[]; active: string; filtersBar: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const track = el.querySelector<HTMLElement>('[data-track]')!;
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', el);
      const lane = track.parentElement!;
      // pan until the last card's right edge meets the container's right edge
      const distance = () => {
        const cs = getComputedStyle(lane);
        return Math.max(0, track.offsetWidth - (lane.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)));
      };
      if (distance() < 8) {
        // everything fits (a narrow filter): nothing to pan
        gsap.set(el.querySelector('[data-pan-hint]'), { autoAlpha: 0 });
        return;
      }
      const lean = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
      const clampSkew = gsap.utils.clamp(-7, 7);
      let settle: gsap.core.Tween | undefined;

      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            lean(clampSkew(self.getVelocity() / -260));
            settle?.kill();
            settle = gsap.delayedCall(0.12, () => lean(0));
            if (counter.current) {
              const i = Math.min(items.length, Math.round(self.progress * (items.length - 1)) + 1);
              counter.current.textContent = pad(i);
            }
          },
        },
      });
      gsap.fromTo(el.querySelector('[data-progress]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true } });

      // cards swing in from the right edge as the track carries them into view
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { rotateY: -28, rotateZ: 2.5, yPercent: 8, autoAlpha: 0.25, transformPerspective: 900, transformOrigin: '0% 50%' },
          {
            rotateY: 0,
            rotateZ: 0,
            yPercent: 0,
            autoAlpha: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 100%', end: 'left 62%', scrub: true },
          },
        );
      });
      requestAnimationFrame(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
      return () => settle?.kill();
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="relative flex h-[100svh] flex-col overflow-hidden pb-16 pt-24">
      <div className="container mx-auto px-6 md:px-10">{filtersBar}</div>

      <div className="container mx-auto flex min-h-0 flex-1 items-center px-6 md:px-10">
        <div data-track className="flex w-max items-stretch gap-6 will-change-transform">
          {items.map((project) => (
            <article key={project.title} data-card data-lock className="panel group flex w-[clamp(20rem,29vw,26rem)] flex-col">
              <ProjectCard project={project} />
            </article>
          ))}
          <div data-card className="flex w-[clamp(16rem,20vw,20rem)] flex-col justify-center gap-4 border-l border-[var(--line)] pl-8">
            <p className="font-display text-3xl font-bold uppercase leading-tight">
              More on <span className="accent-text">GitHub</span>
            </p>
            <a href="https://github.com/Champion2049" target="_blank" rel="noopener noreferrer" className="btn-hud btn-hud-ghost self-start">
              <Github size={15} /> Champion2049
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex items-center gap-4 px-6 md:px-10">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          <span ref={counter} className="text-primary">01</span> / {pad(items.length)}
        </span>
        <div className="relative h-px flex-1 bg-[var(--line)]">
          <span data-progress className="absolute inset-0 origin-left bg-primary shadow-[0_0_8px_hsl(186_100%_50%/0.8)]" />
        </div>
        <span data-pan-hint className="text-sm text-muted-foreground">Scroll to pan</span>
      </div>
    </div>
  );
}

export function ProjectsSection() {
  const [active, setActive] = useState<'All' | Category>('All');
  const gallery = useGalleryMode();
  const lenis = useLenis();
  const section = useRef<HTMLElement>(null);

  const visible = active === 'All' ? others : others.filter((p) => p.category === active);

  const choose = (f: 'All' | Category) => {
    if (f === active) return;
    // In the gallery the pin length changes with the filter: rewind to the first card first.
    const pinned = gallery && section.current?.querySelector('.pin-spacer');
    if (pinned && lenis) {
      const top = (pinned as HTMLElement).getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) lenis.scrollTo(top, { immediate: true, force: true });
    }
    setActive(f);
  };

  const filtersBar = (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const count = f === 'All' ? others.length : others.filter((p) => p.category === f).length;
        return (
          <button
            key={f}
            onClick={() => choose(f)}
            aria-pressed={active === f}
            className={`press border px-4 py-2 text-sm ${
              active === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-[var(--line-strong)] text-muted-foreground hover:border-primary hover:text-foreground'
            }`}
          >
            {f} <span className="ml-1 opacity-50">{count}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="projects" ref={section} className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="05"
          title={<>Things I've <span className="accent-text">built</span></>}
          description="From 3D face reconstruction and RF anomaly detection to reinforcement-learning agents and full-stack tooling."
        />
        <CaseFiles projects={caseFiles} />
        <h3 className="mt-24 font-display text-2xl font-bold uppercase tracking-wide md:mt-32 md:text-3xl">More projects</h3>
        <p className="mt-2 text-muted-foreground">Filter by domain.</p>
      </div>

      {gallery ? (
        <Gallery items={visible} active={active} filtersBar={filtersBar} />
      ) : (
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10 mt-6">{filtersBar}</div>
          <motion.div layout className="grid gap-5 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((project) => (
                <motion.article
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="panel group flex flex-col"
                >
                  <ProjectCard project={project} />
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </section>
  );
}
