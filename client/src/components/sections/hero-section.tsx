import { useEffect, useRef } from 'react';
import { ArrowDownRight, Download } from 'lucide-react';
import { TronGrid } from '@/components/ui/tron-grid';
import { Barcode } from '@/components/hud/barcode';
import { gsap, useGSAP, DECODE_CHARS, prefersReducedMotion } from '@/lib/gsap';
import { useIntroReady } from '@/lib/intro-gate';
import { useLenis } from '@/components/ui/lenis-scroll-provider';

const roles = ['Deep Learning Research', 'RF & Signal Processing', 'Production ML Deployment', 'Published Researcher', 'ICPC Regionalist'];

const specs = [
  { label: 'CGPA', value: '9.29' },
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

/** Distance from `el` to the top of `ancestor`, by offsetTop (unaffected by transforms). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== ancestor) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

/** The name, one span per letter so each can react to the cursor. */
function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <span key={i} data-ch className="hero-ch">
          {ch}
        </span>
      ))}
    </>
  );
}

const FIELD_RADIUS = 170;
const FIELD_LIFT = 20;

/**
 * Letters near the pointer rise and light up (outlined ones fill in).
 * Rects are cached and re-read only after a scroll/resize, so a pointermove is
 * arithmetic plus a few transform writes. Fine pointers only, never with reduced motion.
 */
function useLetterField(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const letters = Array.from(section.querySelectorAll<HTMLElement>('[data-ch]'));
    const lift = letters.map((el) => gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' }));
    const tilt = letters.map((el) => gsap.quickTo(el, 'rotation', { duration: 0.6, ease: 'power3.out' }));
    let centers: { x: number; y: number }[] = [];
    let dirty = true;
    let inside = false;

    const measure = () => {
      centers = letters.map((el) => {
        const r = el.getBoundingClientRect();
        // subtract our own lift so the field doesn't chase itself
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 - (gsap.getProperty(el, 'y') as number) };
      });
      dirty = false;
    };
    const reset = () => {
      letters.forEach((el, i) => {
        lift[i](0);
        tilt[i](0);
        el.removeAttribute('data-hot');
      });
    };
    const onMove = (e: PointerEvent) => {
      if (!inside) return;
      if (dirty) measure();
      for (let i = 0; i < letters.length; i++) {
        const dx = e.clientX - centers[i].x;
        const dy = e.clientY - centers[i].y;
        const f = Math.max(0, 1 - Math.hypot(dx, dy) / FIELD_RADIUS);
        const k = f * f;
        lift[i](-k * FIELD_LIFT);
        tilt[i](-(dx / FIELD_RADIUS) * k * 8);
        if (f > 0.55) letters[i].setAttribute('data-hot', '');
        else letters[i].removeAttribute('data-hot');
      }
    };
    const onEnter = () => {
      inside = true;
      dirty = true;
    };
    const onLeave = () => {
      inside = false;
      reset();
    };
    const markDirty = () => (dirty = true);

    section.addEventListener('pointerenter', onEnter);
    section.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', markDirty, { passive: true });
    window.addEventListener('resize', markDirty);
    return () => {
      section.removeEventListener('pointerenter', onEnter);
      section.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', markDirty);
      window.removeEventListener('resize', markDirty);
      reset();
    };
  }, [root]);
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
        .from(q('[data-enter="line"]'), {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.08,
          // the lines are masked only for this reveal; after it the letters need room to rise
          onComplete: () => {
            gsap.set(q('[data-scroll="first"], [data-scroll="last"]'), { overflow: 'visible' });
          },
        })
        .from(q('[data-enter="handle"]'), { scale: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(3)' }, 0.35)
        .from(q('[data-enter="box"]'), { scaleX: 0, duration: 0.9, ease: 'expo.inOut' }, 0.2)
        .from(q('[data-enter="fade"]'), { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.06 }, 0.55)
        .from(q('[data-enter="cell"]'), { autoAlpha: 0, yPercent: 40, duration: 0.7, stagger: 0.05 }, 0.75);
    },
    { scope: root, dependencies: [ready] },
  );

  // Scroll scene (desktop): a light-cycle rides the seam between the two name
  // lines and lays a light wall; the halves get shoved apart, then the whole
  // hero collapses into the wall like a CRT switching off, and the wall pinches out.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const section = root.current!;
        const q = gsap.utils.selector(section);
        const seam = q('[data-seam]')[0] as HTMLElement;
        const content = q('[data-scroll="content"]')[0] as HTMLElement;
        const bike = q('[data-bike]')[0] as HTMLElement;
        const ribbon = q('[data-ribbon]')[0] as HTMLElement;
        // offsetTop ignores transforms, so these stay right while the scene is mid-scrub
        const seamY = () => offsetWithin(seam, section);
        const originY = () => `50% ${seamY() - offsetWithin(content, section)}px`;

        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top top', end: '+=95%', scrub: 0.6, pin: true, invalidateOnRefresh: true },
          })
          .set(q('[data-lane]'), { y: seamY }, 0)
          // the ribbon's centre sits at 64.6% of the bike's height, so this puts it on the seam
          .fromTo(q('[data-bike]'), { yPercent: -64.6, x: () => -bike.offsetWidth }, { x: () => window.innerWidth * 1.15, duration: 0.4 }, 0)
          .to(q('[data-scroll="box"]'), { autoAlpha: 0, scaleY: 1.25, duration: 0.25 }, 0.05)
          .to(q('[data-scroll="first"]'), { yPercent: -30, ease: 'power2.out', duration: 0.3 }, 0.1)
          .to(q('[data-scroll="last"]'), { yPercent: 30, ease: 'power2.out', duration: 0.3 }, 0.1)
          // CRT off: everything folds into the seam, the ribbon flattens to a line with it
          .to(content, { transformOrigin: originY, scaleY: 0.004, scaleX: 1.04, ease: 'power3.in', duration: 0.28 }, 0.42)
          .to(q('[data-ribbon]'), { scaleY: () => 3 / ribbon.offsetHeight, ease: 'power3.in', duration: 0.28 }, 0.42)
          .to(q('[data-scroll="guides"]'), { autoAlpha: 0, duration: 0.2 }, 0.45)
          .set(content, { autoAlpha: 0 }, 0.7)
          .set(q('[data-bike]'), { autoAlpha: 0 }, 0.7)
          .set(q('[data-wall]'), { autoAlpha: 1 }, 0.7)
          .to(q('[data-wall]'), { scaleX: 0, ease: 'power3.in', duration: 0.16 }, 0.7)
          .fromTo(q('[data-wall-core]'), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.05 }, 0.8)
          .to(q('[data-wall-core]'), { autoAlpha: 0, scale: 0.2, duration: 0.1 }, 0.9)
          .to(q('[data-scroll="grid"]'), { yPercent: -10, scale: 1.12, autoAlpha: 0, duration: 0.35 }, 0.55);
      });
    },
    { scope: root },
  );

  useLetterField(root);

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
      <div data-scroll="guides" aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {[25, 50, 75].map((x) => (
          <span key={x} className="absolute inset-y-0 w-px bg-[var(--line)]" style={{ left: `${x}%` }} />
        ))}
      </div>

      {/* Light-cycle lane, placed on the seam between the name lines (desktop scroll scene) */}
      <div data-lane aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden md:block">
        <div data-bike className="absolute left-0 top-0 w-[clamp(140px,13vw,200px)]">
          {/* light wall: ends at the rear-wheel hub, spans the rear wheel's height */}
          <span data-ribbon className="light-ribbon absolute right-[86.6%] top-[35.4%] h-[58.5%] w-[150vw]" />
          <span className="tron-bike block aspect-[202/82] w-full" />
        </div>
        <div data-wall className="invisible absolute inset-x-0 -top-px h-[3px] bg-[hsl(186_100%_80%)] shadow-[0_0_14px_hsl(186_100%_50%),0_0_40px_hsl(186_100%_50%/0.6)]" />
        <span data-wall-core className="invisible absolute left-1/2 top-0 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-white shadow-[0_0_18px_6px_hsl(186_100%_60%)]" />
      </div>

      <div data-scroll="content" className="container relative z-10 mx-auto flex flex-1 flex-col px-6 pb-24 pt-24 md:px-10 md:pt-28">
        {/* Top meta row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div data-enter="fade" className="space-y-1">
            <div className="hud-label">File 001 / Portfolio_2026</div>
            <div className="hud-label text-foreground/80">AI &amp; Data Science · Bengaluru</div>
          </div>
          <div data-enter="fade" className="signal-tag">
            Open to internships &amp; research
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
                <span data-enter="line" className="block text-[clamp(2.6rem,9.6vw,9.5rem)]">
                  <Letters text="Chirayu" />
                </span>
              </span>
              <span data-seam aria-hidden className="block h-0" />
              <span aria-hidden data-scroll="last" className="block overflow-hidden text-right">
                <span data-enter="line" className="block text-[clamp(2.6rem,9.6vw,9.5rem)] text-transparent [-webkit-text-stroke:2px_hsl(186_100%_50%)]">
                  <Letters text="Chaudhari" />
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
            Third-year AI &amp; Data Science student with three peer-reviewed publications. My work spans deep-learning research,
            RF &amp; signal processing, and production ML deployment.
          </p>
        </div>
      </div>
    </section>
  );
}
