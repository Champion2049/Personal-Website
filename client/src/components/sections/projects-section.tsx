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
/** Where the gallery holds the page: this many px past the top of the screen, inside its trigger. */
const HOLD_AT = 2;

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
 * Horizontal gallery, one card per scroll. When the gallery reaches the top of
 * the screen it holds the page: each scroll gesture (wheel, trackpad swipe,
 * touch swipe or arrow key) moves the track exactly one card, however big the
 * gesture, and moving again takes a new gesture (the rest of a flick and its
 * inertia are swallowed). Past the last card, or back before the first, the
 * page scrolls on as normal. Input is intercepted before Lenis sees it rather
 * than stopping Lenis, so nav links and the command palette still work, and
 * scrolling away by any means releases the hold. Rebuilt when the filter changes.
 */
function Gallery({ items, active, filtersBar }: { items: Project[]; active: string; filtersBar: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const el = root.current!;
      const track = el.querySelector<HTMLElement>('[data-track]')!;
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', el);
      const lane = track.parentElement!;
      const bar = el.querySelector<HTMLElement>('[data-progress]');
      // how far the track can travel: until the last card's right edge meets the container's right edge
      const distance = () => {
        const cs = getComputedStyle(lane);
        return Math.max(0, track.offsetWidth - (lane.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)));
      };
      if (distance() < 8) {
        // everything fits (a narrow filter): nothing to step through
        gsap.set(el.querySelector('[data-pan-hint]'), { autoAlpha: 0 });
        gsap.set(bar, { scaleX: 1 });
        return;
      }
      // one stop per card, clamped to the end (the last few cards share the final stop)
      const stops = () => {
        const d = distance();
        const out: number[] = [];
        for (const c of cards) {
          const x = Math.min(c.offsetLeft - cards[0].offsetLeft, d);
          if (!out.length || x - out[out.length - 1] > 4) out.push(x);
        }
        return out;
      };
      let at = stops();
      let index = 0;
      const lean = gsap.quickTo(track, 'skewX', { duration: 0.45, ease: 'power3.out' });

      const show = (dir = 0) => {
        gsap.to(track, { x: -at[index], duration: dir ? 0.75 : 0, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(bar, { scaleX: at.length > 1 ? index / (at.length - 1) : 1, duration: dir ? 0.75 : 0, ease: 'power3.out', overwrite: 'auto' });
        // cards already passed fade back, so their cut-off edge in the margin doesn't compete
        cards.forEach((c, i) => gsap.to(c, { autoAlpha: i < index ? 0.2 : 1, duration: dir ? 0.5 : 0, overwrite: 'auto' }));
        if (dir) {
          lean(-dir * 4);
          gsap.delayedCall(0.18, () => lean(0));
        }
        if (counter.current) counter.current.textContent = pad(index === at.length - 1 ? items.length : index + 1);
      };
      show();

      // ---- the hold ----
      let held = false;
      let armed = false; // a new gesture may move the track
      let quiet = 0;
      let lastInput = -1e9; // when the visitor last scrolled by hand (vs. a nav link's programmatic scroll)
      const rearm = () => {
        window.clearTimeout(quiet);
        quiet = window.setTimeout(() => (armed = true), 220); // a gesture has ended once input goes quiet
      };
      const hold = (self: ScrollTrigger, force = false) => {
        if (held) return;
        // only when the visitor scrolled here themselves: a nav link or the command palette passing
        // through on its way somewhere else mustn't get caught
        if (!force && (performance.now() - lastInput > 600 || Math.abs(self.scroll() - self.start) > window.innerHeight)) return;
        held = true;
        armed = false;
        rearm();
        // stop wherever the gesture that brought us here was heading, with the gallery filling the screen.
        // Hold a couple of pixels inside the trigger: sitting exactly on its start counts as having left.
        const y = self.start + HOLD_AT;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      };
      const release = () => {
        held = false;
        window.clearTimeout(quiet);
      };
      const move = (dir: number) => {
        const next = index + dir;
        if (next < 0 || next >= at.length) return release(); // past either end: the page takes over
        index = next;
        show(dir);
      };

      const onWheel = (e: WheelEvent) => {
        lastInput = performance.now();
        if (!held) return;
        e.preventDefault();
        e.stopPropagation(); // capture phase: Lenis never sees it
        const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        const go = armed && Math.abs(d) > 2;
        armed = false;
        rearm();
        if (go) move(Math.sign(d));
      };
      let touchY = 0;
      const onTouchStart = (e: TouchEvent) => {
        lastInput = performance.now();
        if (held) touchY = e.touches[0].clientY;
      };
      const onTouchMove = (e: TouchEvent) => {
        lastInput = performance.now();
        if (held) e.preventDefault();
      };
      const onTouchEnd = (e: TouchEvent) => {
        if (!held) return;
        const dy = touchY - e.changedTouches[0].clientY;
        if (Math.abs(dy) > 30) move(Math.sign(dy));
      };
      const onKey = (e: KeyboardEvent) => {
        lastInput = performance.now();
        if (!held || (e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
        const fwd = ['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
        const back = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
        if (!fwd && !back) return;
        e.preventDefault();
        move(fwd ? 1 : -1);
      };
      window.addEventListener('wheel', onWheel, { capture: true, passive: false });
      window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
      window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
      window.addEventListener('touchend', onTouchEnd, { capture: true });
      window.addEventListener('keydown', onKey, { capture: true });

      // hold when the gallery's top reaches the top of the screen, from either direction; any scroll away releases
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: `+=${HOLD_AT * 2}`,
        onEnter: (self) => hold(self),
        onEnterBack: (self) => hold(self),
        // a fast scroll can jump the whole (tiny) trigger in one frame, so leave fires right after the
        // enter that just pulled the page back inside: only let go if we're really outside now
        onLeave: (self) => window.scrollY > self.end && release(),
        onLeaveBack: (self) => window.scrollY < self.start && release(),
        onRefresh: () => {
          at = stops();
          index = Math.min(index, at.length - 1);
          show();
        },
      });
      // rebuilt (a filter changed) while sitting on the gallery: keep holding
      if (Math.abs(window.scrollY - (st.start + HOLD_AT)) < 3) hold(st, true);

      return () => {
        release();
        window.removeEventListener('wheel', onWheel, { capture: true });
        window.removeEventListener('touchstart', onTouchStart, { capture: true });
        window.removeEventListener('touchmove', onTouchMove, { capture: true });
        window.removeEventListener('touchend', onTouchEnd, { capture: true });
        window.removeEventListener('keydown', onKey, { capture: true });
      };
    },
    { scope: root, dependencies: [active, lenis], revertOnUpdate: true },
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
        <span data-pan-hint className="text-sm text-muted-foreground">Scroll for the next one</span>
      </div>
    </div>
  );
}

export function ProjectsSection() {
  const [active, setActive] = useState<'All' | Category>('All');
  const gallery = useGalleryMode();
  const section = useRef<HTMLElement>(null);

  const visible = active === 'All' ? others : others.filter((p) => p.category === active);

  const choose = (f: 'All' | Category) => {
    if (f !== active) setActive(f);
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
