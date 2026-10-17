import { useEffect, useRef } from 'react';

/**
 * Iconic TRON perspective floor — a neon lattice receding to a glowing
 * horizon, rolling toward the viewer.
 *
 * Drawn on a 2D canvas: the static parts (converging lines, horizon glow) are
 * rendered once per resize to an offscreen layer; each frame only blits that
 * and strokes ~30 floor lines, then applies the fade with a single
 * destination-in fill. That replaces a 3D-transformed, double-masked CSS plane
 * which was the single biggest scroll-jank source on the site.
 * Redraws at 30fps, pauses off-screen / in hidden tabs; one static frame for reduced motion.
 */
type Fade = 'none' | 'center' | 'top';

const HORIZON = 0.34; // horizon height as a fraction of the box
const SPEED = 1.1; // floor rows per second
const FRAME_MS = 1000 / 30; // a slow background: 30fps is indistinguishable and halves the work

export function TronGrid({
  color = '#00e5ff',
  className = '',
  fade = 'none',
  paused = false,
}: {
  color?: string;
  className?: string;
  fade?: Fade;
  /** Stop redrawing (e.g. while something opaque covers it). */
  paused?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layer = document.createElement('canvas');
    const lctx = layer.getContext('2d')!;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const paintStatic = () => {
      layer.width = canvas.width;
      layer.height = canvas.height;
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hy = h * HORIZON;
      const vx = w / 2;

      // horizon glow + line (a wide faint stroke under a thin bright one stands in for shadowBlur)
      const glow = lctx.createRadialGradient(vx, hy, 0, vx, hy, w * 0.55);
      glow.addColorStop(0, `${color}38`);
      glow.addColorStop(1, `${color}00`);
      lctx.fillStyle = glow;
      lctx.fillRect(0, hy - 180, w, 300);
      lctx.strokeStyle = color;
      lctx.globalAlpha = 0.18;
      lctx.lineWidth = 7;
      lctx.beginPath();
      lctx.moveTo(0, hy);
      lctx.lineTo(w, hy);
      lctx.stroke();
      lctx.globalAlpha = 0.75;
      lctx.lineWidth = 1;
      lctx.stroke();

      // floor lines converging on the vanishing point
      const g = lctx.createLinearGradient(0, hy, 0, h);
      g.addColorStop(0, `${color}00`);
      g.addColorStop(1, `${color}66`);
      lctx.globalAlpha = 1;
      lctx.strokeStyle = g;
      const spacing = Math.max(70, w * 0.085);
      const n = Math.ceil((w * 1.4) / spacing);
      lctx.beginPath();
      for (let c = -n; c <= n; c++) {
        lctx.moveTo(vx, hy);
        lctx.lineTo(vx + c * spacing * 1.9, h);
      }
      lctx.stroke();
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      paintStatic();
      draw(lastT);
    };

    const applyFade = () => {
      if (fade === 'none') return;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      const cx = w / 2;
      const cy = fade === 'top' ? 0 : h * 0.7;
      const rx = fade === 'top' ? w * 0.75 : w * 0.62;
      const ry = fade === 'top' ? h * 1.0 : h * 0.62;
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(fade === 'top' ? 0.05 : 0.25, 'rgba(0,0,0,1)');
      g.addColorStop(fade === 'top' ? 0.7 : 0.95, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
    };

    let lastT = 0;
    const draw = (t: number) => {
      lastT = t;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // rows at world depth z = k - offset, projected with y = horizon + depth / z
      const hy = h * HORIZON;
      const depth = h - hy;
      const offset = reduce ? 0.35 : ((t / 1000) * SPEED) % 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let k = 1; k < 40; k++) {
        const z = k - offset;
        if (z < 0.92) continue;
        const y = hy + depth / z;
        if (y - hy < 1.5) break;
        ctx.globalAlpha = 0.5 * Math.pow(Math.min(1, (y - hy) / depth), 0.55);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      applyFade();
    };

    let raf = 0;
    let visible = true;
    const loop = (t: number) => {
      if (t - lastT >= FRAME_MS) draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce || paused || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [color, fade, paused]);

  return <canvas ref={ref} aria-hidden className={`absolute inset-0 h-full w-full ${className}`} />;
}
