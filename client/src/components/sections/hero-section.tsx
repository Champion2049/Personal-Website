import { useEffect, useRef } from 'react';
import { ArrowDownRight, Download } from 'lucide-react';
import { TronGrid } from '@/components/ui/tron-grid';
import { Barcode } from '@/components/hud/barcode';
import { gsap, useGSAP, DECODE_CHARS, prefersReducedMotion } from '@/lib/gsap';
import { useIntroReady } from '@/lib/intro-gate';
import { useLenis } from '@/components/ui/lenis-scroll-provider';

const roles = ['AI Engineering Intern', 'ML & Signal Processing', 'Full-Stack Developer', 'Published IEEE Author', 'ICPC Regionalist'];

const specs = [
  { label: 'CGPA', value: '9.33' },
  { label: 'Publications', value: '03' },
  { label: 'Novo Nordisk', value: 'Top 6' },
  { label: 'ICPC', value: 'Regionalist' },
];

/** Cycles the role line by decoding from one role into the next. */
function useRoleDecode(ref: React.RefObject<HTMLSpanElement>, run: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !run) return;
    if (prefersReducedMotion()) {
      el.textContent = roles[0];
      return;
    }
    const tl = gsap.timeline({ repeat: -1 });
    roles.forEach((_, k) => {
      const next = roles[(k + 1) % roles.length];
      tl.to(el, { duration: 0.8, ease: 'none', scrambleText: { text: next, chars: DECODE_CHARS, speed: 0.8 } }, `+=${k === 0 ? 2.2 : 2.4}`);
    });
    return () => {
      tl.kill();
    };
  }, [run]);
}

export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const role = useRef<HTMLSpanElement>(null);
  const ready = useIntroReady();
  const lenis = useLenis();
  useRoleDecode(role, ready);

  // Entrance: plays when the intro overlay lifts (or right away on later visits).
  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from(q('[data-enter="line"]'), { yPercent: 110, duration: 1.1, stagger: 0.08 })
        .from(q('[data-enter="handle"]'), { scale: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(3)' }, 0.35)
        .from(q('[data-enter="box"]'), { scaleX: 0, duration: 0.9, ease: 'expo.inOut' }, 0.2)
        .from(q('[data-enter="fade"]'), { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.06 }, 0.55)
        .from(q('[data-enter="cell"]'), { autoAlpha: 0, yPercent: 40, duration: 0.7, stagger: 0.05 }, 0.75);
    },
    { scope: root, dependencies: [ready] },
  );

  // Scroll scene (desktop): pin briefly, split the name apart, open a light slit.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const q = gsap.utils.selector(root);
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=75%', scrub: 0.6, pin: true } })
          .to(q('[data-scroll="first"]'), { xPercent: -18, ease: 'none' }, 0)
          .to(q('[data-scroll="last"]'), { xPercent: 18, ease: 'none' }, 0)
          .to(q('[data-scroll="box"]'), { scaleX: 1.15, scaleY: 1.3, autoAlpha: 0, ease: 'none' }, 0)
          .to(q('[data-scroll="grid"]'), { yPercent: -12, scale: 1.15, ease: 'none' }, 0)
          .fromTo(q('[data-scroll="slit"]'), { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, ease: 'power2.in' }, 0.35)
          .to(q('[data-scroll="content"]'), { autoAlpha: 0, ease: 'none' }, 0.55);
      });
    },
    { scope: root },
  );

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" ref={root} data-intro={ready ? 'done' : 'pending'} className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div data-scroll="grid" aria-hidden className="absolute inset-0">
        <TronGrid color="#00e5ff" fade="center" />
      </div>
      {/* Column guides (the spec-sheet grid) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {[25, 50, 75].map((x) => (
          <span key={x} className="absolute inset-y-0 w-px bg-[var(--line)]" style={{ left: `${x}%` }} />
        ))}
      </div>
      {/* Light slit — opens as the hero scrolls away */}
      <div
        data-scroll="slit"
        aria-hidden
        className="pointer-events-none invisible absolute inset-y-0 left-1/2 z-20 w-[34vw] -translate-x-1/2 bg-[radial-gradient(closest-side,hsl(186_100%_92%),hsl(186_100%_50%/0.55)_45%,transparent)]"
      />

      <div data-scroll="content" className="container relative z-10 mx-auto flex flex-1 flex-col px-6 pb-24 pt-24 md:px-10 md:pt-28">
        {/* Top meta row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div data-enter="fade" className="space-y-1">
            <div className="hud-label">File 001 / Portfolio_2026</div>
            <div className="hud-label text-foreground/80">AI &amp; Data Science · Bengaluru</div>
          </div>
          <div data-enter="fade" className="signal-tag">
            <span className="h-1.5 w-1.5 animate-pulse bg-background" /> Open to internships &amp; research
          </div>
        </div>

        {/* Name in a crop-selection box */}
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="relative mx-auto w-full max-w-6xl">
            <div data-scroll="box" aria-hidden className="pointer-events-none absolute -inset-x-3 -inset-y-4 md:-inset-x-8 md:-inset-y-6">
              <div data-enter="box" className="absolute inset-0 origin-left border border-[var(--line-strong)]" />
              {['-left-1 -top-1', '-right-1 -top-1', '-left-1 -bottom-1', '-right-1 -bottom-1', 'left-1/2 -top-1 -ml-1', 'left-1/2 -bottom-1 -ml-1'].map((p) => (
                <span key={p} data-enter="handle" className={`absolute h-2 w-2 bg-foreground ${p}`} />
              ))}
            </div>

            <h1 className="font-display font-extrabold uppercase leading-[0.86] tracking-tight">
              <span className="sr-only">Chirayu Chaudhari</span>
              <span aria-hidden data-scroll="first" className="block overflow-hidden">
                <span data-enter="line" className="block text-[clamp(2.6rem,9.6vw,9.5rem)]">Chirayu</span>
              </span>
              <span aria-hidden data-scroll="last" className="block overflow-hidden text-right">
                <span data-enter="line" className="block text-[clamp(2.6rem,9.6vw,9.5rem)] text-transparent [-webkit-text-stroke:2px_hsl(186_100%_50%)]">
                  Chaudhari
                </span>
              </span>
            </h1>

            <div className="mt-6">
              <span data-enter="fade" className="font-mono text-sm uppercase tracking-[0.14em] text-foreground md:text-base">
                <span className="text-primary">&gt;&gt; </span>
                <span ref={role} aria-live="off">{roles[0]}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div data-enter="fade" className="mb-8 flex flex-wrap items-center gap-3">
          <button onClick={() => scrollTo('projects')} className="btn-hud group">
            View projects <ArrowDownRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </button>
          <a href="/Chirayu_Chaudhari_Resume.pdf" target="_blank" rel="noopener noreferrer" className="btn-hud btn-hud-ghost">
            <Download size={15} /> Résumé
          </a>
        </div>

        {/* Spec strip (after the metadata footer in the IP.AXIS reference); gap-px draws the hairlines */}
        <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-4 xl:grid-cols-[auto_repeat(4,minmax(0,1fr))_minmax(0,1.6fr)]">
          <div data-enter="cell" className="col-span-2 flex items-center gap-3 bg-background p-3 md:col-span-4 xl:col-span-1">
            <Barcode value="CHIRAYU-CHAUDHARI" className="h-9 w-32 text-foreground" />
            <span className="hud-label leading-tight">Trade&shy;mark<br />CC/26</span>
          </div>
          {specs.map((s) => (
            <div key={s.label} data-enter="cell" className="bg-background p-3">
              <div className="flex items-center gap-2">
                <span className="hud-label">{s.label}</span>
                <span aria-hidden className="hatch h-2 flex-1" />
              </div>
              <div className="mt-1.5 font-display text-xl font-bold uppercase leading-tight xl:text-[clamp(1rem,1.3vw,1.5rem)]">{s.value}</div>
            </div>
          ))}
          <p data-enter="cell" className="col-span-2 hidden bg-background p-3 text-xs leading-relaxed text-muted-foreground md:col-span-4 md:block xl:col-span-1">
            Third-year AI &amp; Data Science student building at the intersection of machine learning, full-stack systems and
            hardware. Published author; into open source, game dev and all things sci-fi.
          </p>
        </div>
      </div>
    </section>
  );
}
