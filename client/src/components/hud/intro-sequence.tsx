import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap, DECODE_CHARS, prefersReducedMotion } from '@/lib/gsap';
import { holdIntro, releaseIntro } from '@/lib/intro-gate';
import { useLenis } from '@/components/ui/lenis-scroll-provider';

/**
 * Opening sting, after the Cyberpunk 2077 logo reveal — rebuilt for this site
 * in Tron light: light-trail fragments → scanline silhouette → LED dot matrix
 * with speed trails → solid with RGB split → shatters into circuit traces →
 * glitches back together → settles over a Tron-grid horizon → a light line
 * collapses the overlay into the hero.
 *
 * Plays on every fresh load of "/" (not on in-app navigation back to it),
 * never with reduced motion. Skip button / click / Esc / Enter jumps to the exit.
 */
const W = 1600;
const H = 900;
const CYAN = '#00e5ff';
const SIGNAL = '#ff5a1f';
const BONE = '#e6edf0';
const WORD = 'CHIRAYU';

const INITIAL_PATH = typeof window !== 'undefined' ? window.location.pathname : '/';
let claimed = false;
function shouldPlay() {
  if (claimed) return false;
  claimed = true;
  if (INITIAL_PATH !== '/' && INITIAL_PATH !== '/index.html') return false;
  return !prefersReducedMotion();
}

/** Small deterministic PRNG so the generated geometry is the same every visit. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Box = { x: number; y: number; width: number; height: number };

function buildGeometry(b: Box) {
  const r = rng(2049);
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;

  // Light-trail fragments flickering around where the word will be
  const fragments = Array.from({ length: 16 }, (_, i) => {
    const x = b.x - 120 + r() * (b.width + 240);
    const y = b.y - 60 + r() * (b.height + 120);
    const dx = (r() - 0.5) * 320;
    const dy = (r() - 0.5) * 90;
    return {
      d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + dx * 0.5 + (r() - 0.5) * 120).toFixed(1)} ${(y + dy * 0.5 - 60 * r()).toFixed(1)} ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`,
      color: i % 5 === 0 ? SIGNAL : i % 3 === 0 ? BONE : CYAN,
    };
  });

  // Rectilinear circuit traces spreading out of the word (PCB style), with vias
  const traces = Array.from({ length: 36 }, (_, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    let x = side > 0 ? b.x + b.width * (0.5 + r() * 0.5) : b.x + b.width * (r() * 0.5);
    let y = b.y + b.height * (0.15 + r() * 0.7);
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const segs = 2 + Math.floor(r() * 3);
    for (let s = 0; s < segs; s++) {
      if (s % 2 === 0) x += side * (70 + r() * 300);
      else y += (r() < 0.5 ? -1 : 1) * (18 + r() * 110);
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return { d, end: { x, y }, color: r() < 0.16 ? SIGNAL : CYAN };
  });

  // Sparks that burst off the word when it goes solid
  const sparks = Array.from({ length: 42 }, () => ({
    x: b.x + r() * b.width,
    y: b.y + r() * b.height,
    tx: (r() - 0.5) * 520,
    ty: (r() - 0.5) * 260,
    s: 2 + r() * 4,
    color: r() < 0.2 ? SIGNAL : r() < 0.5 ? BONE : CYAN,
  }));

  // Horizontal bands for the glitch reassembly
  const bands = Array.from({ length: 6 }, (_, i) => ({
    y: b.y - 10 + (i * (b.height + 20)) / 6,
    h: (b.height + 20) / 6 + 1,
    dx: (r() - 0.5) * 140,
  }));

  return { fragments, traces, sparks, bands, cx, cy };
}

export function IntroSequence() {
  const [active, setActive] = useState(() => shouldPlay());
  const [box, setBox] = useState<Box | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const measure = useRef<SVGTextElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const skipRequested = useRef(false);
  const lenis = useLenis();
  const geo = useMemo(() => (box ? buildGeometry(box) : null), [box]);

  // Claim the gate before the hero checks it, and freeze scrolling while we play.
  useLayoutEffect(() => {
    if (!active) return;
    holdIntro('intro');
    document.documentElement.style.overflow = 'hidden';
    return () => {
      releaseIntro('intro');
      document.documentElement.style.overflow = '';
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [active, lenis]);

  // Wait for the display face (so we measure the real glyphs), then measure the word.
  useLayoutEffect(() => {
    if (!active) return;
    let cancelled = false;
    const fontReady = document.fonts?.load ? document.fonts.load('800 100px Tomorrow') : Promise.resolve();
    Promise.race([fontReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (cancelled || !measure.current) return;
      const bb = measure.current.getBBox();
      setBox({ x: bb.x, y: bb.y, width: bb.width, height: bb.height });
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  // The timeline
  useLayoutEffect(() => {
    if (!active || !geo || !root.current) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const finish = () => setActive(false);

      gsap.set(q('[data-l]'), { autoAlpha: 0 });
      gsap.set(q('[data-frag], [data-trace]'), { drawSVG: '0% 0%', autoAlpha: 1 });

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tlRef.current = tl;

      // 1 · light-trail fragments flicker in and out (each draws, then retracts — never overlapping)
      q('[data-frag]').forEach((el: Element, i: number) => {
        const at = 0.05 + ((i * 7) % 16) * 0.03;
        tl.to(el, { drawSVG: '0% 100%', duration: 0.3 }, at)
          .to(el, { drawSVG: '100% 100%', duration: 0.26, ease: 'power2.in' }, at + 0.3)
          .set(el, { autoAlpha: 0 }, at + 0.56);
      });

      // 2 · scanline silhouette with a beam through it
      tl.set(q('[data-l="scan"]'), { autoAlpha: 1 }, 0.62)
        .fromTo(q('[data-l="beam"]'), { autoAlpha: 1, scaleX: 0, transformOrigin: '50% 50%' }, { scaleX: 1, duration: 0.35, ease: 'expo.out' }, 0.62)
        .to(q('[data-l="scan"]'), { x: 6, duration: 0.08, repeat: 3, yoyo: true, ease: 'steps(1)' }, 0.7)
        .to(q('[data-l="beam"]'), { autoAlpha: 0, duration: 0.25 }, 1.05)
        .set(q('[data-l="scan"]'), { autoAlpha: 0 }, 1.12);

      // 3 · LED dot matrix + speed trails
      tl.set(q('[data-l="dots"]'), { autoAlpha: 1 }, 1.12)
        .fromTo(q('[data-l="trail"]'), { autoAlpha: 1, scaleX: 0, transformOrigin: (i: number) => (i === 0 ? '100% 50%' : '0% 50%') }, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, 1.12)
        .to(q('[data-l="trail"]'), { autoAlpha: 0, duration: 0.25 }, 1.5)
        .set(q('[data-l="dots"]'), { autoAlpha: 0 }, 1.62);

      // 4 · solid, RGB split converging, sparks bursting
      tl.set(q('[data-l="solid"], [data-l="rgb"]'), { autoAlpha: 1 }, 1.62)
        .fromTo(q('[data-rgb="c"]'), { x: -16 }, { x: 0, duration: 0.4, ease: 'expo.out' }, 1.62)
        .fromTo(q('[data-rgb="m"]'), { x: 16 }, { x: 0, duration: 0.4, ease: 'expo.out' }, 1.62)
        .set(q('[data-spark]'), { autoAlpha: 1 }, 1.62)
        .to(q('[data-spark]'), { x: (i) => geo.sparks[i].tx, y: (i) => geo.sparks[i].ty, autoAlpha: 0, duration: 0.7, ease: 'expo.out' }, 1.62)
        .to(q('[data-l="rgb"]'), { autoAlpha: 0, duration: 0.2 }, 1.95);

      // 5 · shatter into circuit traces
      tl.to(q('[data-l="solid"]'), { autoAlpha: 0.12, duration: 0.15 }, 2.02)
        .set(q('[data-l="outline"]'), { autoAlpha: 1 }, 2.02)
        .to(q('[data-trace]'), { drawSVG: '0% 100%', duration: 0.42, ease: 'power3.out', stagger: { each: 0.008, from: 'center' } }, 2.02)
        .fromTo(q('[data-via]'), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.2, transformOrigin: '50% 50%', stagger: 0.008 }, 2.2)
        .to(q('[data-trace]'), { drawSVG: '100% 100%', duration: 0.3, ease: 'power3.in', stagger: { each: 0.006, from: 'edges' } }, 2.5)
        .to(q('[data-via]'), { autoAlpha: 0, duration: 0.2 }, 2.6)
        .set(q('[data-l="outline"]'), { autoAlpha: 0 }, 2.72);

      // 6 · glitch slices snap back together
      tl.set(q('[data-l="slices"]'), { autoAlpha: 1 }, 2.68)
        .fromTo(q('[data-band]'), { x: (i) => geo.bands[i].dx }, { x: 0, duration: 0.3, ease: 'steps(4)', stagger: 0.03 }, 2.68)
        .set(q('[data-l="slices"]'), { autoAlpha: 0 }, 3.08)
        .set(q('[data-l="solid"]'), { autoAlpha: 1 }, 3.08);

      // 7 · settle: glow, horizon, subtitle decode
      tl.addLabel('settle', 3.05)
        .fromTo(q('[data-l="glow"]'), { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.6 }, 'settle')
        .fromTo(q('[data-l="horizon"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 'settle')
        .set(q('[data-l="sub"]'), { autoAlpha: 1 }, 'settle')
        .to(q('[data-sub]'), { duration: 0.7, scrambleText: { text: 'AI & DATA SCIENCE  //  BENGALURU', chars: DECODE_CHARS, speed: 0.8 } }, 'settle')

      // 8 · a light line collapses the overlay into the page
      tl.addLabel('exit', 4.05)
        .call(() => releaseIntro('intro'), [], 'exit')
        .fromTo(q('[data-line]'), { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.3, ease: 'expo.out' }, 'exit')
        .to(root.current, { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.55, ease: 'expo.inOut' }, 'exit+=0.12')
        .to(q('[data-line]'), { autoAlpha: 0, duration: 0.2 }, 'exit+=0.55')
        .call(finish, [], 'exit+=0.7');

      // skipped before the timeline existed (while the font was loading)
      if (skipRequested.current) tl.seek('exit');
    }, root);

    return () => ctx.revert();
  }, [active, geo]);

  // Skippable from the first frame: click anywhere, Esc, Enter or Space.
  useEffect(() => {
    if (!active || !root.current) return;
    const skip = () => {
      skipRequested.current = true;
      const tl = tlRef.current;
      if (tl && tl.time() < tl.labels.exit) tl.seek('exit');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        skip();
      }
    };
    const el = root.current;
    el.addEventListener('click', skip);
    window.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('click', skip);
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  if (!active) return null;

  const word = { x: W / 2, y: 470, textAnchor: 'middle' as const, fontFamily: 'Tomorrow, sans-serif', fontWeight: 800, fontSize: 228, letterSpacing: 8 };

  return (
    <div
      ref={root}
      role="presentation"
      className="fixed inset-0 z-[150] cursor-pointer select-none bg-[#030508]"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="i-scan" width="8" height="7" patternUnits="userSpaceOnUse">
            <rect width="8" height="2.4" fill={BONE} />
          </pattern>
          <pattern id="i-dots" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="5.5" cy="5.5" r="3.7" fill={CYAN} />
          </pattern>
          <linearGradient id="i-beam" x1="0" x2="1">
            <stop offset="0" stopColor={CYAN} stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="1" stopColor={CYAN} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="i-planet" cx="0.5" cy="0" r="0.75">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.35" />
            <stop offset="0.35" stopColor={CYAN} stopOpacity="0.08" />
            <stop offset="1" stopColor="#030508" stopOpacity="0" />
          </radialGradient>
          <filter id="i-glow" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <clipPath id="i-planet-clip">
            <ellipse cx={W / 2} cy={1310} rx={1150} ry={520} />
          </clipPath>
          {geo?.bands.map((band, i) => (
            <clipPath key={i} id={`i-band-${i}`}>
              <rect x={0} y={band.y} width={W} height={band.h} />
            </clipPath>
          ))}
        </defs>

        {/* Measuring copy (never shown) */}
        <text ref={measure} {...word} opacity={0}>{WORD}</text>

        {geo && (
          <>
            {/* Tron-grid planet horizon */}
            <g data-l="horizon">
              <ellipse cx={W / 2} cy={1310} rx={1150} ry={520} fill="url(#i-planet)" stroke={CYAN} strokeOpacity={0.7} strokeWidth={2} />
              <g clipPath="url(#i-planet-clip)" stroke={CYAN} strokeOpacity={0.28} strokeWidth={1.2}>
                {Array.from({ length: 17 }, (_, i) => (
                  <line key={`r${i}`} x1={W / 2} y1={760} x2={W / 2 + (i - 8) * 230} y2={H + 40} />
                ))}
                {[810, 835, 868, 912].map((y) => (
                  <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} />
                ))}
              </g>
            </g>

            {/* 1 · fragments */}
            <g fill="none" strokeLinecap="round" strokeWidth={3}>
              {geo.fragments.map((f, i) => (
                <path key={i} data-frag d={f.d} stroke={f.color} />
              ))}
            </g>

            {/* 2 · scanline silhouette + beam */}
            <rect data-l="beam" x={60} y={geo.cy - 5} width={W - 120} height={10} fill="url(#i-beam)" />
            <text data-l="scan" {...word} fill="url(#i-scan)">{WORD}</text>

            {/* 3 · LED dot matrix + speed trails */}
            <rect data-l="trail" x={0} y={geo.cy - 40} width={box!.x - 14} height={80} fill="url(#i-dots)" />
            <rect data-l="trail" x={box!.x + box!.width + 14} y={geo.cy - 40} width={W - (box!.x + box!.width + 14)} height={80} fill="url(#i-dots)" />
            <text data-l="dots" {...word} fill="url(#i-dots)">{WORD}</text>

            {/* glow under the settled word */}
            <text data-l="glow" {...word} fill={CYAN} filter="url(#i-glow)">{WORD}</text>

            {/* 4 · solid + RGB split + sparks */}
            <g data-l="rgb" style={{ mixBlendMode: 'screen' }}>
              <text data-rgb="c" {...word} fill={CYAN}>{WORD}</text>
              <text data-rgb="m" {...word} fill={SIGNAL}>{WORD}</text>
            </g>
            <text data-l="solid" {...word} fill={BONE}>{WORD}</text>
            {geo.sparks.map((s, i) => (
              <rect key={i} data-spark x={s.x} y={s.y} width={s.s} height={s.s} fill={s.color} opacity={0} />
            ))}

            {/* 5 · circuit traces + outline word */}
            <text data-l="outline" {...word} fill="none" stroke={CYAN} strokeWidth={2}>{WORD}</text>
            <g fill="none" strokeWidth={2.2} strokeLinejoin="miter">
              {geo.traces.map((t, i) => (
                <path key={i} data-trace d={t.d} stroke={t.color} />
              ))}
            </g>
            {geo.traces.map((t, i) => (
              <circle key={i} data-via cx={t.end.x} cy={t.end.y} r={5} fill="#030508" stroke={t.color} strokeWidth={2.2} opacity={0} />
            ))}

            {/* 6 · glitch slices */}
            <g data-l="slices">
              {geo.bands.map((_, i) => (
                <g key={i} clipPath={`url(#i-band-${i})`}>
                  <text data-band {...word} fill={i % 2 ? BONE : CYAN}>{WORD}</text>
                </g>
              ))}
            </g>

            {/* 7 · subtitle */}
            <g data-l="sub">
              <text data-sub x={W / 2} y={560} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize={24} letterSpacing={6} fill={BONE} fillOpacity={0.8}>
                {' '}
              </text>
            </g>
          </>
        )}
      </svg>

      {/* exit light line */}
      <div data-line className="invisible absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,#fff,transparent)] shadow-[0_0_24px_6px_rgba(0,229,255,0.7)]" />
      <button
        className="absolute bottom-6 right-6 border border-white/25 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/60 transition-colors hover:border-[#00e5ff] hover:text-[#00e5ff]"
      >
        Skip intro ›
      </button>
    </div>
  );
}
