import { useEffect, useRef } from 'react';

const DROPS = 130;
const FRAME_MS = 1000 / 30;

/**
 * Thin rain over Night City that reacts to scrolling: the streaks stretch and
 * rush with scroll speed, and swing to the scroll direction (scroll down and
 * you're climbing through it). One fixed 2D canvas at 30fps, DPR 1; paused in
 * hidden tabs and skipped for reduced motion.
 */
export function NCRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let w = 0;
    let h = 0;
    const drops = Array.from({ length: DROPS }, () => ({ x: 0, y: 0, len: 0, speed: 0, alpha: 0 }));
    const seed = (d: (typeof drops)[number], anywhere: boolean) => {
      d.x = Math.random() * (w + 200) - 100;
      d.y = anywhere ? Math.random() * h : -40 - Math.random() * 120;
      d.len = 10 + Math.random() * 22;
      d.speed = 380 + Math.random() * 420; // px/s
      d.alpha = 0.06 + Math.random() * 0.16;
    };
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      drops.forEach((d) => seed(d, true));
    };
    resize();

    let raf = 0;
    let last = 0;
    let lastY = window.scrollY;
    let v = 0; // smoothed scroll velocity, px/s
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = t - last;
      if (dt < FRAME_MS) return;
      last = t;
      const s = Math.min(dt, 100) / 1000;
      const y = window.scrollY;
      v += ((y - lastY) / s - v) * 0.25;
      lastY = y;

      const boost = Math.min(1, Math.abs(v) / 2500);
      const fall = 1 + boost * 2.2; // rush
      const stretch = 1 + boost * 3; // streak length
      const slant = 0.18;

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'hsl(4 80% 72%)';
      for (const d of drops) {
        // scrolling down moves the world up past you, so the rain rushes upward relative to the view
        const vy = d.speed * fall + v * 0.35;
        const vx = -d.speed * slant;
        d.y += vy * s;
        d.x += vx * s;
        if (vy >= 0 ? d.y > h + 60 : d.y < -60) {
          seed(d, false);
          if (vy < 0) d.y = h + 20 + Math.random() * 100;
        } else if (d.x < -120) {
          seed(d, false);
        }
        const l = d.len * stretch;
        const m = Math.hypot(vx, vy) || 1;
        ctx.globalAlpha = d.alpha * (1 + boost);
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - (vx / m) * l, d.y - (vy / m) * l);
        ctx.stroke();
      }
    };
    const start = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    start();
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[1]" />;
}
