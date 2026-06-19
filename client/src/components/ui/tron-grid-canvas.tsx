import { useEffect, useRef } from 'react';

/**
 * High-performance animated TRON grid rendered on a 2D canvas.
 * - Perspective floor receding to a glowing horizon, scrolling toward the viewer.
 * - A couple of neon "light trails" race along the lattice.
 * - Subtle parallax follows the pointer.
 * - Respects prefers-reduced-motion (draws a single static frame) and pauses when hidden.
 */
export function TronGridCanvas({ color = '#22d3ee', className = '' }: { color?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parallax = { x: 0, tx: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMove = (e: MouseEvent) => { parallax.tx = ((e.clientX / window.innerWidth) - 0.5) * 2; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', resize);

    // Trails travel from horizon toward the viewer on fixed grid columns.
    const trails = Array.from({ length: 3 }).map((_, i) => ({
      col: [-3, 1, 4][i],
      z: Math.random(),
      speed: 0.10 + i * 0.04,
    }));

    const NUM_ROWS = 18;
    const draw = (time: number) => {
      const horizon = h * 0.42;
      const vpX = w / 2 + parallax.x * w * 0.06;
      ctx.clearRect(0, 0, w, h);

      // ambient horizon glow
      const glow = ctx.createRadialGradient(vpX, horizon, 0, vpX, horizon, w * 0.5);
      glow.addColorStop(0, color + '33');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizon - 160, w, 320);

      // horizon line
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(w, horizon);
      ctx.stroke();

      const scroll = reduce ? 0 : (time * 0.00006) % 1;

      // horizontal floor lines (perspective via 1/(1-t))
      ctx.shadowBlur = 8;
      for (let i = 0; i < NUM_ROWS; i++) {
        let t = (i + scroll) / NUM_ROWS;       // 0 -> near, 1 -> horizon
        const p = t * t;                        // ease toward horizon
        const y = horizon + (h - horizon) * (1 - p);
        if (y < horizon || y > h) continue;
        const a = 0.10 + 0.42 * (1 - t);
        ctx.globalAlpha = a;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // vertical lines converging to the vanishing point
      const spread = w * 1.6;
      for (let c = -10; c <= 10; c++) {
        const baseX = vpX + (c / 10) * spread;
        ctx.globalAlpha = 0.16 + 0.12 * (1 - Math.abs(c) / 10);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vpX + (c / 10) * (w * 0.06), horizon);
        ctx.lineTo(baseX, h);
        ctx.stroke();
      }

      // light trails
      if (!reduce) {
        for (const tr of trails) {
          tr.z += tr.speed * 0.016;
          if (tr.z > 1) tr.z -= 1;
          const t = tr.z;
          const p = 1 - (1 - t) * (1 - t);
          const y = horizon + (h - horizon) * p;
          const x = vpX + (tr.col / 10) * (w * 0.06 + (spread - w * 0.06) * p);
          const len = 14 + 80 * p;
          const g2 = ctx.createLinearGradient(x, y - len, x, y);
          g2.addColorStop(0, 'transparent');
          g2.addColorStop(1, color);
          ctx.globalAlpha = 0.9 * (0.3 + 0.7 * p);
          ctx.strokeStyle = g2;
          ctx.lineWidth = 2 + 2 * p;
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.moveTo(x, y - len);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.9 * (0.3 + 0.7 * p);
          ctx.beginPath();
          ctx.arc(x, y, 1.5 + 1.5 * p, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = color;
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    let raf = 0;
    let running = true;
    const loop = (t: number) => {
      parallax.x += (parallax.tx - parallax.x) * 0.05;
      draw(t);
      if (running && !reduce) raf = requestAnimationFrame(loop);
    };
    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduce) { running = true; raf = requestAnimationFrame(loop); }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [color]);

  return <canvas ref={ref} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
