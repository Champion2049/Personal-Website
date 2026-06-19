import { useEffect, useRef } from 'react';

/**
 * Animated "circuit board" field — a jittered lattice of nodes linked by
 * orthogonal traces, with glowing data packets travelling along them.
 * On-theme for an AI/engineer + TRON aesthetic. Pass a hue-based color.
 */
export function CircuitBackground({
  color = '#22d3ee',
  className = '',
}: {
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parent = canvas.parentElement!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    type Node = { x: number; y: number };
    type Edge = { a: Node; b: Node };
    type Pulse = { edge: Edge; t: number; speed: number; dir: 1 | -1 };
    let nodes: Node[][] = [];
    let edges: Edge[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;

    const build = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gap = 92;
      const cols = Math.ceil(w / gap) + 2;
      const rows = Math.ceil(h / gap) + 2;
      nodes = [];
      for (let r = 0; r < rows; r++) {
        const row: Node[] = [];
        for (let c = 0; c < cols; c++) {
          row.push({
            x: c * gap - gap + (((r * 31 + c * 17) % 20) - 10),
            y: r * gap - gap + (((c * 23 + r * 13) % 20) - 10),
          });
        }
        nodes.push(row);
      }
      edges = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n = nodes[r][c];
          if (c + 1 < cols && (r * 7 + c * 5) % 4 !== 0) edges.push({ a: n, b: nodes[r][c + 1] });
          if (r + 1 < rows && (r * 3 + c * 11) % 4 !== 0) edges.push({ a: n, b: nodes[r + 1][c] });
        }
      }
      const count = Math.min(28, Math.floor(edges.length / 8));
      pulses = Array.from({ length: count }, () => ({
        edge: edges[(Math.random() * edges.length) | 0],
        t: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
        dir: Math.random() > 0.5 ? 1 : -1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // traces
      ctx.lineWidth = 1;
      ctx.strokeStyle = color + '14';
      ctx.beginPath();
      for (const e of edges) {
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
      }
      ctx.stroke();

      // nodes
      ctx.fillStyle = color + '22';
      for (const row of nodes) for (const n of row) {
        ctx.fillRect(n.x - 1, n.y - 1, 2, 2);
      }

      // packets
      for (const p of pulses) {
        p.t += p.speed * p.dir;
        if (p.t > 1 || p.t < 0) {
          p.edge = edges[(Math.random() * edges.length) | 0];
          p.t = p.dir === 1 ? 0 : 1;
          if (Math.random() > 0.7) p.dir = (p.dir * -1) as 1 | -1;
        }
        const { a, b } = p.edge;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    build();
    if (reduce) { draw(); cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => build());
    ro.observe(parent);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [color]);

  return <canvas ref={ref} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
