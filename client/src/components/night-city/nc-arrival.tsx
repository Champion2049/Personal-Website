import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { useIntroReady } from '@/lib/intro-gate';

/**
 * Arrival: a camera flythrough of a rainy Night City street, rendered in
 * Blender (tools/blender/night_city_flythrough.py) as a WebP frame sequence and
 * scrubbed by scroll on a canvas, Apple-product-page style. The section pins
 * while you scroll through it; a few lines of copy hand over along the way.
 *
 * Frames arrive as compressed blobs (a few MB in total) and are decoded off the
 * main thread with createImageBitmap, but only a window around the current
 * frame is kept decoded (a whole sequence of decoded 720p frames would be
 * hundreds of MB and thrash the image cache). Neighbouring frames are blended
 * by the fractional position, so the scrub is smoother than the frame count.
 * Portrait screens get their own re-framed sequence. Reduced motion: the
 * poster frame, no pin.
 */
const SETS = {
  desktop: { dir: '/nightcity/fly/d', count: 120 },
  mobile: { dir: '/nightcity/fly/m', count: 90 },
} as const;
const src = (dir: string, i: number) => `${dir}/${String(i + 1).padStart(4, '0')}.webp`;
const BEHIND = 4; // decoded frames kept behind the playhead
const AHEAD = 12; // ...and ahead of it, in the direction of travel

/** Compressed frames plus a small window of decoded ones around the playhead. */
function createFrameStore(dir: string, count: number, onDecoded: (i: number) => void) {
  const blobs: (Blob | undefined)[] = new Array(count);
  const bitmaps = new Map<number, ImageBitmap>();
  const pending = new Set<number>();
  let lo = 0;
  let hi = AHEAD;
  let dead = false;

  const decode = (i: number) => {
    const blob = blobs[i];
    if (!blob || bitmaps.has(i) || pending.has(i)) return;
    pending.add(i);
    createImageBitmap(blob)
      .then((bmp) => {
        pending.delete(i);
        if (dead || i < lo || i > hi) return bmp.close();
        bitmaps.set(i, bmp);
        onDecoded(i);
      })
      .catch(() => pending.delete(i));
  };

  return {
    /** Fetch every frame (frame 0 first), a few at a time. */
    async load(only?: number) {
      const fetchOne = async (i: number) => {
        try {
          const res = await fetch(src(dir, i));
          if (!res.ok) return;
          blobs[i] = await res.blob();
          if (i >= lo && i <= hi) decode(i);
        } catch {
          /* offline / aborted: the nearest frame stands in */
        }
      };
      await fetchOne(0);
      if (only !== undefined) return;
      const queue = Array.from({ length: count - 1 }, (_, k) => k + 1);
      const worker = async () => {
        while (queue.length && !dead) await fetchOne(queue.shift()!);
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
    },
    /** Move the decode window to `i` (direction-aware) and release frames outside it. */
    focus(i: number, dir: number) {
      lo = Math.max(0, i - (dir >= 0 ? BEHIND : AHEAD));
      hi = Math.min(count - 1, i + (dir >= 0 ? AHEAD : BEHIND));
      bitmaps.forEach((bmp, k) => {
        if (k < lo || k > hi) {
          bmp.close();
          bitmaps.delete(k);
        }
      });
      for (let k = lo; k <= hi; k++) decode(k);
    },
    /** The decoded frame nearest to i. */
    nearest(i: number) {
      if (bitmaps.has(i)) return bitmaps.get(i)!;
      for (let d = 1; d < count; d++) {
        const b = bitmaps.get(i - d) ?? bitmaps.get(i + d);
        if (b) return b;
      }
      return undefined;
    },
    get(i: number) {
      return bitmaps.get(i);
    },
    dispose() {
      dead = true;
      bitmaps.forEach((b) => b.close());
      bitmaps.clear();
    },
  };
}

export function NCArrival({ onCover }: { onCover?: (covering: boolean) => void }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ready = useIntroReady();
  const [reduce] = useState(prefersReducedMotion);
  const [set] = useState(() => (typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 0.9 ? SETS.mobile : SETS.desktop));
  const store = useRef<ReturnType<typeof createFrameStore> | null>(null);
  const pos = useRef(0); // fractional frame position
  const blend = useRef(true); // blend neighbouring frames (slow scrubs only)

  // Draw the frame at the fractional position, blending into the next one; cover-fitted.
  const draw = () => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    const st = store.current;
    if (!c || !ctx || !st) return;
    const i = Math.floor(pos.current);
    const a = st.get(i) ?? st.nearest(i);
    if (!a) return;
    const s = Math.max(c.width / a.width, c.height / a.height);
    const w = a.width * s;
    const h = a.height * s;
    const x = (c.width - w) / 2;
    const y = (c.height - h) / 2;
    ctx.globalAlpha = 1;
    ctx.drawImage(a, x, y, w, h);
    const t = pos.current - i;
    const b = blend.current && t > 0.05 ? st.get(i + 1) : undefined;
    if (b && st.get(i)) {
      ctx.globalAlpha = t;
      ctx.drawImage(b, x, y, w, h);
      ctx.globalAlpha = 1;
    }
  };

  // Size the canvas to the viewport and stream the frames in, first frame first.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const st = createFrameStore(set.dir, set.count, (i) => {
      if (Math.abs(i - pos.current) < 2) draw();
    });
    store.current = st;
    st.focus(0, 1);
    // 1x is enough: the frames are only 1280px wide, and a bigger canvas just costs more per draw
    const resize = () => {
      c.width = c.clientWidth;
      c.height = c.clientHeight;
      draw();
    };
    resize();
    window.addEventListener('resize', resize);
    st.load(reduce ? 0 : undefined);
    return () => {
      window.removeEventListener('resize', resize);
      st.dispose();
      store.current = null;
    };
  }, [set, reduce]);

  // Scroll: pin and scrub the frames; two lines of copy hand over, then the render's own sign.
  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);
      const proxy = { f: 0 };
      // Redraw at most 30 times a second; it's a film sequence, and each draw is a full-screen blit.
      let want = 0;
      let lastDraw = 0;
      let lastFrame = 0;
      const tick = (time: number) => {
        if (want === pos.current || time - lastDraw < 1 / 30) return;
        lastDraw = time;
        const dir = Math.sign(want - pos.current);
        // a fast scrub can't show the in-between anyway; skip the second draw
        blend.current = Math.abs(want - pos.current) < 1.5;
        pos.current = want;
        const i = Math.floor(want);
        if (i !== lastFrame) {
          lastFrame = i;
          store.current?.focus(i, dir);
        }
        draw();
      };
      gsap.ticker.add(tick);
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=220%',
            scrub: 0.5,
            pin: true,
            // it fills the screen from the top of the page until the pin releases
            onRefresh: (self) => onCover?.(self.scroll() < self.end),
            onLeave: () => onCover?.(false),
            onEnterBack: () => onCover?.(true),
          },
        })
        .to(proxy, {
          f: set.count - 1,
          duration: 1,
          onUpdate: () => {
            want = proxy.f;
          },
        }, 0)
        .to(q('[data-hint]'), { autoAlpha: 0, duration: 0.05 }, 0.02)
        .to(q('[data-beat="1"]'), { autoAlpha: 0, y: -40, duration: 0.1 }, 0.2)
        .fromTo(q('[data-beat="2"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.32)
        .to(q('[data-beat="2"]'), { autoAlpha: 0, y: -40, duration: 0.1 }, 0.55)
        // the last stretch belongs to the sign in the render; dim it a little as the page takes over
        .to(q('[data-shade]'), { opacity: 0.45, duration: 0.08 }, 0.92);
      return () => gsap.ticker.remove(tick);
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
