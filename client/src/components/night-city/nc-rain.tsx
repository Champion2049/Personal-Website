import { useEffect, useRef } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

const DROPS = 90;
const FRAME_MS = 1000 / 30;
const SCALE = 1; // the canvas renders at half resolution; soft streaks read as rain anyway

/**
 * Rain that only falls while you move. Scrolling brings it in, the streaks
 * stretch and rush with scroll speed and swing with direction (scroll down and
 * you're climbing through it), and it fades out shortly after you stop. While
 * you're reading it's gone and costs nothing: no loop, no layer updates.
 * A half-resolution canvas at 30fps while active; hidden while `paused`;
 * none for reduced motion.
 */
export function NCRain({ paused = false }: { paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let w = 0;
    let h = 0;
    const drops = Array.from({ length: DROPS }, () => ({ x: 0, y: 0, len: 0, speed: 0, alpha: 0 }));
    const seed = (d: (typeof drops)[number], anywhere: boolean) => {
      d.x = Math.random() * (w + 100) - 50;
      d.y = anywhere ? Math.random() * h : -20 - Math.random() * 60;
      d.len = 5 + Math.random() * 11;
      d.speed = 190 + Math.random() * 210; // px/s at half resolution
      d.alpha = 0.1 + Math.random() * 0.2;
    };
    const resize = () => {
      w = canvas.width = Math.round(window.innerWidth * SCALE);
      h = canvas.height = Math.round(window.innerHeight * SCALE);
      drops.forEach((d) => seed(d, true));
    };
    resize();

    let raf = 0;
    let last = 0;
    let v = 0; // scroll velocity, px/s
    let level = 0; // 0..1, how much rain is showing
    let target = 0;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = t - last;
      if (dt < FRAME_MS) return;
      last = t;
      const s = Math.min(dt, 100) / 1000;
      level += (target - level) * Math.min(1, s * 6);
      ctx.clearRect(0, 0, w, h);
      if (level < 0.02 && target === 0) {
        // faded out: stop until the next scroll
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      const boost = Math.min(1, Math.abs(v) / 2500);
      const fall = 1 + boost * 2.2;
      const stretch = 1 + boost * 3;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'hsl(4 80% 72%)';
      for (const d of drops) {
        const vy = d.speed * fall + v * SCALE * 0.35;
        const vx = -d.speed * 0.18;
        d.y += vy * s;
        d.x += vx * s;
        if (vy >= 0 ? d.y > h + 30 : d.y < -30) {
          seed(d, false);
          if (vy < 0) d.y = h + 10 + Math.random() * 50;
        } else if (d.x < -60) {
          seed(d, false);
        }
        const l = d.len * stretch;
        const m = Math.hypot(vx, vy) || 1;
        ctx.globalAlpha = d.alpha * level * (1 + boost);
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - (vx / m) * l, d.y - (vy / m) * l);
        ctx.stroke();
      }
    };
    const wake = () => {
      if (!raf && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        v = self.getVelocity();
        target = Math.min(1, 0.35 + Math.abs(v) / 1500);
        wake();
      },
    });
    const calm = () => {
      v = 0;
      target = 0;
    };
    ScrollTrigger.addEventListener('scrollEnd', calm);
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      st.kill();
      ScrollTrigger.removeEventListener('scrollEnd', calm);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[1] h-full w-full motion-reduce:hidden ${paused ? 'invisible' : ''}`}
    />
  );
}
