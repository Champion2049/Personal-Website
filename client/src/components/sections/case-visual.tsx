import { useEffect, useRef } from 'react';
import type { CaseVisualKind } from '@/lib/projects-data';

/**
 * A small animated "screen" for each case file, drawn in code instead of a
 * screen recording: what the project looks at, abstracted. One canvas, 30fps,
 * only while on screen; a single still frame for reduced motion.
 */
const CYAN = 'hsl(186 100% 50%)';
const RED = 'hsl(2 100% 62%)';
const YELLOW = 'hsl(56 100% 60%)';
const BONE = 'hsl(200 22% 92%)';
const DIM = 'hsl(200 22% 92% / 0.12)';
const FRAME_MS = 1000 / 30;

type Draw = (g: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

/** Seeded noise so every visit draws the same scene. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

// DECA: a turning wireframe face cycling through expressions (mouth opens, brows lift), with landmarks.
const faceMesh: Draw = (g, w, h, t) => {
  const cx = w / 2;
  const cy = h / 2 + h * 0.02;
  const R = Math.min(w, h) * 0.36;
  const yaw = Math.sin(t * 0.45) * 0.45;
  const expr = (Math.sin(t * 1.2) + 1) / 2; // 0 neutral .. 1 open mouth, raised brows
  const bump = (x: number, y: number, bx: number, by: number, sx: number, sy: number) =>
    Math.exp(-(((x - bx) ** 2) / sx + ((y - by) ** 2) / sy));
  // the face is a height field on the front of a head-shaped ellipsoid
  const point = (u: number, v: number) => {
    const th = (u - 0.5) * Math.PI * 1.25; // front ~225 degrees
    const ph = v * Math.PI;
    let x = Math.sin(ph) * Math.sin(th) * 0.74;
    let y = -Math.cos(ph) * 1.0;
    let z = Math.sin(ph) * Math.cos(th) * 0.8;
    if (y > 0.25) x *= 1 - (y - 0.25) * 0.55; // jaw taper
    const f = Math.max(0, Math.cos(th)); // only the front gets features
    const mouthOpen = expr * 0.07;
    z +=
      f *
      (bump(x, y, 0, 0.02, 0.006, 0.07) * 0.34 + // nose bridge + tip
        bump(x, y, 0, 0.62, 0.05, 0.02) * 0.1 - // chin
        bump(x, y, -0.27, -0.16, 0.012, 0.008) * 0.14 - // eye sockets
        bump(x, y, 0.27, -0.16, 0.012, 0.008) * 0.14 +
        bump(x, y, -0.27, -0.3 - expr * 0.04, 0.03, 0.003) * 0.08 + // brows (lift with expression)
        bump(x, y, 0.27, -0.3 - expr * 0.04, 0.03, 0.003) * 0.08 -
        bump(x, y, 0, 0.38, 0.04, 0.002 + mouthOpen * 0.05) * (0.06 + mouthOpen * 1.6)); // mouth
    const X = x * Math.cos(yaw) + z * Math.sin(yaw);
    const Z = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const s = 3 / (3 - Z);
    return [cx + X * R * s, cy + y * R * s, Z] as const;
  };
  g.lineWidth = 1;
  const rows = 26;
  const cols = 34;
  for (let i = 1; i < rows; i++) {
    g.beginPath();
    for (let j = 0; j <= cols; j++) {
      const [x, y] = point(j / cols, i / rows);
      if (j === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokeStyle = 'hsl(186 100% 50% / 0.42)';
    g.stroke();
  }
  for (let j = 0; j <= cols; j++) {
    g.beginPath();
    for (let i = 1; i < rows; i++) {
      const [x, y] = point(j / cols, i / rows);
      if (i === 1) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    const edge = Math.abs(j / cols - 0.5) * 2;
    g.strokeStyle = `hsl(186 100% 50% / ${0.32 - edge * 0.22})`;
    g.stroke();
  }
  // landmarks: eye corners, nose tip, mouth corners
  g.fillStyle = YELLOW;
  const lm: [number, number, number][] = [[-0.36, -0.16, 0], [-0.18, -0.16, 0], [0.18, -0.16, 0], [0.36, -0.16, 0], [0, 0.12, 0.3], [-0.16, 0.38, 0], [0.16, 0.38, 0]];
  for (const [lx, ly, lz] of lm) {
    // invert the landmark into (u, v) roughly: x = sin(ph) sin(th) * .74, y = -cos(ph)
    const ph = Math.acos(-ly);
    const th = Math.asin(Math.max(-1, Math.min(1, lx / (0.74 * Math.sin(ph)))));
    const [px, py] = point(th / (Math.PI * 1.25) + 0.5, ph / Math.PI);
    void lz;
    g.fillRect(px - 2, py - 2, 4, 4);
  }
};

// Spam call: a voice waveform scrolling in, its spectrogram, and the fused score climbing past the flag line.
const callSignal: Draw = (g, w, h, t) => {
  const top = h * 0.32;
  g.strokeStyle = CYAN;
  g.lineWidth = 1.2;
  g.beginPath();
  for (let x = 0; x < w; x += 2) {
    const k = x * 0.045 + t * 6;
    const env = 0.35 + 0.65 * Math.abs(Math.sin(k * 0.13) * Math.sin(k * 0.031 + 1));
    const y = top + Math.sin(k) * Math.sin(k * 0.37) * env * h * 0.13;
    if (x === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  // spectrogram band
  const sy = h * 0.52;
  const sh = h * 0.24;
  const cols = 64;
  const rows = 12;
  const cw = w / cols;
  const ch = sh / rows;
  for (let c = 0; c < cols; c++) {
    const tt = (c + Math.floor(t * 18)) * 0.19;
    for (let r = 0; r < rows; r++) {
      const e = Math.max(0, Math.sin(tt + r * 0.6) * Math.cos(tt * 0.41 - r * 0.25)) * (1 - r / rows);
      g.fillStyle = e > 0.45 ? `hsl(${16 + e * 30} 100% ${40 + e * 25}% / ${0.25 + e * 0.6})` : `hsl(186 100% 50% / ${e * 0.35})`;
      g.fillRect(c * cw, sy + sh - (r + 1) * ch, cw - 1, ch - 1);
    }
  }
  // fused score
  const score = Math.min(1, ((t * 0.18) % 1.25) / 0.95);
  const by = h * 0.86;
  g.fillStyle = DIM;
  g.fillRect(0, by, w, 6);
  g.fillStyle = score > 0.8 ? RED : YELLOW;
  g.fillRect(0, by, w * score, 6);
  g.fillStyle = BONE;
  g.fillRect(w * 0.8, by - 6, 2, 18);
  g.font = '600 12px "JetBrains Mono", monospace';
  g.fillStyle = score > 0.8 ? RED : 'hsl(200 22% 92% / 0.6)';
  g.fillText(score > 0.8 ? 'FLAGGED · see reasoning' : `fusion ${score.toFixed(2)}`, 0, by - 10);
};

// SDR: a QPSK constellation; most symbols land in the four clusters, an anomalous burst flares red and fades.
const constellation: Draw = (g, w, h, t) => {
  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(w, h) * 0.3;
  g.strokeStyle = DIM;
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(cx - s * 1.5, cy);
  g.lineTo(cx + s * 1.5, cy);
  g.moveTo(cx, cy - s * 1.5);
  g.lineTo(cx, cy + s * 1.5);
  g.stroke();
  const r = rng(1 + (Math.floor(t * 30) % 4000));
  for (let i = 0; i < 260; i++) {
    const q = Math.floor(r() * 4);
    const ix = (q & 1 ? 1 : -1) * s * 0.7;
    const iy = (q & 2 ? 1 : -1) * s * 0.7;
    const n = () => (r() + r() + r() - 1.5) * s * 0.22;
    g.fillStyle = 'hsl(186 100% 60% / 0.55)';
    g.fillRect(cx + ix + n(), cy + iy + n(), 2, 2);
  }
  const phase = (t % 3) / 3;
  if (phase < 0.45) {
    const a = 1 - phase / 0.45;
    const rr = rng(77 + Math.floor(t / 3));
    for (let i = 0; i < 40; i++) {
      const ang = rr() * Math.PI * 2;
      const rad = s * (0.2 + rr() * 1.1);
      g.fillStyle = `hsl(2 100% 62% / ${a})`;
      g.fillRect(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 3, 3);
    }
    g.strokeStyle = `hsl(2 100% 62% / ${a * 0.8})`;
    g.beginPath();
    g.arc(cx, cy, s * (1.25 + phase), 0, Math.PI * 2);
    g.stroke();
  }
};

// RL: five agents' learning curves drawing in, then holding.
const learningCurves: Draw = (g, w, h, t) => {
  const agents = [
    { name: 'PPO', color: CYAN, rate: 1.0, cap: 0.86 },
    { name: 'SAC', color: YELLOW, rate: 0.85, cap: 0.82 },
    { name: 'DDPG', color: RED, rate: 0.7, cap: 0.74 },
    { name: 'A2C', color: BONE, rate: 0.6, cap: 0.66 },
    { name: 'DQN', color: 'hsl(200 22% 92% / 0.45)', rate: 0.45, cap: 0.55 },
  ];
  const pad = 28;
  const pw = w - pad * 2;
  const ph = h - pad * 2;
  g.strokeStyle = DIM;
  g.beginPath();
  g.moveTo(pad, pad);
  g.lineTo(pad, h - pad);
  g.lineTo(w - pad, h - pad);
  g.stroke();
  const prog = Math.min(1, (t % 9) / 6);
  g.font = '600 11px "JetBrains Mono", monospace';
  agents.forEach((a, k) => {
    const r = rng(11 + k);
    g.strokeStyle = a.color;
    g.lineWidth = 1.5;
    g.beginPath();
    let ly = 0;
    const steps = 90;
    for (let i = 0; i <= steps * prog; i++) {
      const x = i / steps;
      const v = a.cap * (1 - Math.exp(-x * 5 * a.rate)) + (r() - 0.5) * 0.05;
      const px = pad + x * pw;
      ly = h - pad - v * ph;
      if (i === 0) g.moveTo(px, ly);
      else g.lineTo(px, ly);
    }
    g.stroke();
    g.fillStyle = a.color;
    g.fillText(a.name, pad + pw * prog + 6, ly + 4);
  });
};

const DRAW: Record<CaseVisualKind, Draw> = {
  'face-mesh': faceMesh,
  'call-signal': callSignal,
  constellation,
  'learning-curves': learningCurves,
};

export function CaseVisual({ kind, className = '' }: { kind: CaseVisualKind; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const draw = DRAW[kind];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let visible = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      draw(g, w, h, (now - t0) / 1000 + 2.5);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      frame(now);
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      frame(performance.now());
    };
    const sync = () => {
      if (visible && !reduce && !document.hidden) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(c);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [kind]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
