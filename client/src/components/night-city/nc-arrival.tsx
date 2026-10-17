import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { useIntroReady } from '@/lib/intro-gate';

/**
 * Arrival: a camera flythrough of a rainy Night City street, rendered in
 * Blender (tools/blender/night_city_flythrough.py) as a WebP frame sequence and
 * scrubbed by scroll on a canvas, Apple-product-page style. The section pins
 * while you scroll through it; a few lines of copy hand over along the way.
 *
 * Frames stream in after the first one; the canvas always shows the nearest
 * frame that has loaded. Portrait screens get their own re-framed sequence.
 * Reduced motion: the poster frame, no pin.
 */
const SETS = {
  desktop: { dir: '/nightcity/fly/d', count: 120 },
  mobile: { dir: '/nightcity/fly/m', count: 90 },
} as const;
const src = (dir: string, i: number) => `${dir}/${String(i + 1).padStart(4, '0')}.webp`;

export function NCArrival() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ready = useIntroReady();
  const [reduce] = useState(prefersReducedMotion);
  const [set] = useState(() => (typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 0.9 ? SETS.mobile : SETS.desktop));
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const current = useRef(0);

  // Draw frame i (or the nearest loaded one) cover-fitted to the canvas.
  const draw = (i: number) => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    let img: HTMLImageElement | null = null;
    for (let d = 0; d < set.count && !img; d++) {
      img = frames.current[i - d] ?? frames.current[i + d] ?? null;
    }
    if (!img) return;
    const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  };

  // Size the canvas to the viewport and stream the frames in, first frame first.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw(current.current);
    };
    resize();
    window.addEventListener('resize', resize);

    let cancelled = false;
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (!cancelled) {
            frames.current[i] = img;
            if (Math.abs(i - current.current) < 2 || i === 0) draw(current.current);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src(set.dir, i);
      });
    // first frame now; the rest a few at a time so they don't crowd out the page
    load(0).then(async () => {
      if (reduce) return;
      const queue = Array.from({ length: set.count - 1 }, (_, k) => k + 1);
      const worker = async () => {
        while (queue.length && !cancelled) await load(queue.shift()!);
      };
      await Promise.all([worker(), worker(), worker()]);
    });
    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
    };
  }, [set, reduce]);

  // Scroll: pin and scrub the frames; two lines of copy hand over, then the render's own sign.
  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);
      const proxy = { f: 0 };
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=220%', scrub: 0.5, pin: true },
        })
        .to(proxy, {
          f: set.count - 1,
          duration: 1,
          onUpdate: () => {
            const i = Math.round(proxy.f);
            if (i !== current.current) {
              current.current = i;
              draw(i);
            }
          },
        }, 0)
        .to(q('[data-hint]'), { autoAlpha: 0, duration: 0.05 }, 0.02)
        .to(q('[data-beat="1"]'), { autoAlpha: 0, y: -40, duration: 0.1 }, 0.2)
        .fromTo(q('[data-beat="2"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.32)
        .to(q('[data-beat="2"]'), { autoAlpha: 0, y: -40, duration: 0.1 }, 0.55)
        // the last stretch belongs to the sign in the render, then the street fades into the page
        .to(q('[data-shade]'), { opacity: 1, duration: 0.08 }, 0.92);
    },
    { scope: root, dependencies: [set] },
  );

  // Entrance once the grid transition lifts.
  useGSAP(
    () => {
      if (!ready || reduce) return;
      gsap.from(root.current!.querySelectorAll('[data-in]'), { autoAlpha: 0, y: 30, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 0.1 });
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section ref={root} aria-label="Arrival in Night City" className="relative h-[100svh] overflow-hidden bg-[hsl(0_45%_4%)]">
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
      {/* keep the copy legible over the brightest frames */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,hsl(0_45%_4%/0.55),transparent_30%,transparent_60%,hsl(0_45%_4%/0.85))]" />
      <div data-shade aria-hidden className="pointer-events-none absolute inset-0 bg-[hsl(0_45%_4%)] opacity-0" />

      <div className="container relative mx-auto flex h-full flex-col justify-end px-5 pb-[14vh] md:px-10">
        <div data-beat="1" className="max-w-4xl">
          <p data-in className="font-display text-xl font-semibold uppercase tracking-[0.3em] text-[var(--nc-yellow)]">You crossed over</p>
          <p data-in data-text="The other side" className="nc-glitch nc-glitch-hover mt-2 block font-display text-[clamp(3.4rem,10vw,9rem)] font-bold uppercase leading-[0.85]">
            The other side
          </p>
        </div>
        <p data-beat="2" className="invisible absolute bottom-[14vh] max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold uppercase leading-[0.95]">
          Games, music, anime <span className="text-[var(--nc-yellow)]">&amp; the rest of me.</span>
        </p>
      </div>

      <div data-hint data-in aria-hidden className="absolute inset-x-0 bottom-6 flex justify-center">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">Scroll to enter</span>
      </div>
    </section>
  );
}
