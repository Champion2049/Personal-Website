import { useEffect, useRef } from 'react';

/**
 * Iconic TRON perspective floor: a neon lattice receding to a glowing
 * horizon, rolling toward the viewer.
 *
 * Two stacked canvases. The static parts (horizon glow, converging lines) are
 * drawn once per resize, already faded. Each frame only clears the floor band
 * on the top canvas and strokes ~30 short rows, each clipped to the fade's
 * extent and faded at its ends by a gradient, so there is no full-canvas
 * composite per frame. Redraws at 30fps, pauses off-screen / in hidden tabs;
 * one static frame for reduced motion or when `paused`.
 */
type Fade = 'none' | 'center' | 'top';

const HORIZON = 0.34; // horizon height as a fraction of the box
const SPEED = 1.1; // floor rows per second
const FRAME_MS = 1000 / 30; // a slow background: 30fps is indistinguishable and halves the work

/** The fade is an ellipse; returns its centre and radii for a box, or null for no fade. */
function fadeEllipse(fade: Fade, w: number, h: number) {
  if (fade === 'none') return null;
  return fade === 'top'
    ? { cx: w / 2, cy: 0, rx: w * 0.75 * 0.7, ry: h * 0.7 }
    : { cx: w / 2, cy: h * 0.7, rx: w * 0.62 * 0.95, ry: h * 0.62 * 0.95 };
}

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
  const staticRef = useRef<HTMLCanvasElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const base = staticRef.current;
    const canvas = ref.current;
    const bctx = base?.getContext('2d');
    const ctx = canvas?.getContext('2d');
    if (!base || !canvas || !bctx || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const applyFade = (c: CanvasRenderingContext2D) => {
      const e = fadeEllipse(fade, w, h);
      if (!e) return;
      c.save();
      c.globalCompositeOperation = 'destination-in';
      c.translate(e.cx, e.cy);
      c.scale(1, e.ry / e.rx);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, e.rx);
      g.addColorStop(fade === 'top' ? 0.07 : 0.26, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(-e.rx, -e.rx, e.rx * 2, e.rx * 2);
      c.restore();
    };

    const paintStatic = () => {
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);
      const hy = h * HORIZON;
      const vx = w / 2;
      // horizon glow + line (a wide faint stroke under a thin bright one stands in for shadowBlur)
      const glow = bctx.createRadialGradient(vx, hy, 0, vx, hy, w * 0.55);
      glow.addColorStop(0, `${color}38`);
      glow.addColorStop(1, `${color}00`);
      bctx.fillStyle = glow;
      bctx.fillRect(0, hy - 180, w, 300);
      bctx.strokeStyle = color;
      bctx.globalAlpha = 0.18;
      bctx.lineWidth = 7;
      bctx.beginPath();
      bctx.moveTo(0, hy);
      bctx.lineTo(w, hy);
      bctx.stroke();
      bctx.globalAlpha = 0.75;
      bctx.lineWidth = 1;
      bctx.stroke();
      // floor lines converging on the vanishing point
      const g = bctx.createLinearGradient(0, hy, 0, h);
      g.addColorStop(0, `${color}00`);
      g.addColorStop(1, `${color}66`);
      bctx.globalAlpha = 1;
      bctx.strokeStyle = g;
      const spacing = Math.max(70, w * 0.085);
      const n = Math.ceil((w * 1.4) / spacing);
      bctx.beginPath();
      for (let c = -n; c <= n; c++) {
        bctx.moveTo(vx, hy);
        bctx.lineTo(vx + c * spacing * 1.9, h);
      }
      bctx.stroke();
      applyFade(bctx);
    };

    let lastT = 0;
    const draw = (t: number) => {
      lastT = t;
      const hy = h * HORIZON;
      const depth = h - hy;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, hy - 2, w, h - hy + 2);
      // rows at world depth z = k - offset, projected with y = horizon + depth / z
      const offset = reduce || paused ? 0.35 : ((t / 1000) * SPEED) % 1;
      const e = fadeEllipse(fade, w, h);
      ctx.lineWidth = 1;
      for (let k = 1; k < 40; k++) {
        const z = k - offset;
        if (z < 0.92) continue;
        const y = hy + depth / z;
        if (y - hy < 1.5) break;
        let x0 = 0;
        let x1 = w;
        let a = 0.5 * Math.pow(Math.min(1, (y - hy) / depth), 0.55);
        if (e) {
          const dy = (y - e.cy) / e.ry;
          if (Math.abs(dy) >= 1) continue;
          const half = e.rx * Math.sqrt(1 - dy * dy);
          x0 = e.cx - half;
          x1 = e.cx + half;
          a *= 1 - Math.abs(dy) * 0.6;
          const g = ctx.createLinearGradient(x0, 0, x1, 0);
          g.addColorStop(0, `${color}00`);
          g.addColorStop(0.3, color);
          g.addColorStop(0.7, color);
          g.addColorStop(1, `${color}00`);
          ctx.strokeStyle = g;
        } else {
          ctx.strokeStyle = color;
        }
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      for (const c of [base, canvas]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      paintStatic();
      draw(lastT);
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
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
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

  return (
    <div aria-hidden className={`absolute inset-0 ${className}`}>
      <canvas ref={staticRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
