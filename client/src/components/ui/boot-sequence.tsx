import { useEffect, useRef, useState } from 'react';

/**
 * TRON-style "system boot" overlay for the home page.
 * - Plays on every genuine load/refresh of the home page ("/").
 * - Does NOT play on client-side route changes (e.g. about-me → home transitions),
 *   because a module-level claim is consumed on the first mount of each page load.
 * - Never renders on /about-me (that page simply doesn't mount this component).
 * - Becomes skippable (click / Esc / Enter) once the page has fully loaded.
 * - Respects prefers-reduced-motion.
 */
const STEPS = [
  'BOOT  loading grid kernel …',
  'AUTH  identity = Chirayu Chaudhari',
  'NET   linking neural net …',
  'GFX   calibrating light cycles …',
  'OK    welcome to the grid',
];

// Captured once, when the JS bundle first loads (i.e. on a real page load / refresh).
const INITIAL_PATH = typeof window !== 'undefined' ? window.location.pathname : '/';
// Only the first BootSequence mount of a given page load is allowed to run.
// This is what stops the boot replaying when Home re-mounts during a transition.
let bootClaimed = false;
function claimFreshHomeLoad(): boolean {
  if (bootClaimed) return false;
  bootClaimed = true;
  return INITIAL_PATH === '/' || INITIAL_PATH === '/index.html';
}

export function BootSequence() {
  const [active, setActive] = useState(false);
  const [shown, setShown] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timers = useRef<number[]>([]);
  const done = useRef(false);

  function finish() {
    if (done.current) return;
    done.current = true;
    timers.current.forEach(clearTimeout);
    setActive(false);
    document.body.style.overflow = '';
  }

  function skip() {
    if (!loaded) return; // only skippable once everything is loaded in
    setFading(true);
    window.setTimeout(finish, 400);
  }

  // Mark the page as fully loaded so the visitor can skip.
  useEffect(() => {
    if (typeof document !== 'undefined' && document.readyState === 'complete') { setLoaded(true); return; }
    const onLoad = () => setLoaded(true);
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  // Play the boot sequence — only on a real home-page load.
  useEffect(() => {
    const fresh = claimFreshHomeLoad();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fresh || reduce) return;

    setActive(true);
    document.body.style.overflow = 'hidden';

    STEPS.forEach((line, i) => {
      timers.current.push(window.setTimeout(() => {
        setShown((p) => [...p, line]);
        setProgress(Math.round(((i + 1) / STEPS.length) * 100));
      }, 320 + i * 360));
    });

    const total = 320 + STEPS.length * 360 + 420;
    timers.current.push(window.setTimeout(() => setFading(true), total));
    timers.current.push(window.setTimeout(finish, total + 650));

    return () => {
      timers.current.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, []);

  // Keyboard skip once loaded.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, loaded]);

  if (!active) return null;

  return (
    <div
      onClick={skip}
      className={`fixed inset-0 z-[120] grid place-items-center bg-[#03070d] transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{ cursor: loaded ? 'pointer' : 'default' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(#22d3ee22 1px, transparent 1px), linear-gradient(90deg, #22d3ee22 1px, transparent 1px)',
          backgroundSize: '38px 38px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      <div className="relative w-[min(90vw,440px)] font-mono text-sm">
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold tracking-[0.35em] text-cyan-300" style={{ textShadow: '0 0 18px #22d3ee' }}>
            CHIRAYU
          </div>
          <div className="mt-1 text-[0.65rem] tracking-[0.3em] text-cyan-500/70">SYSTEM BOOT</div>
        </div>
        <div className="min-h-[7.5rem] space-y-1">
          {shown.map((l, i) => (
            <div key={i} className="text-cyan-200/90">
              <span className="text-cyan-500">›</span> {l}
            </div>
          ))}
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cyan-500/15">
          <div
            className="h-full rounded-full bg-cyan-400 transition-[width] duration-300"
            style={{ width: `${progress}%`, boxShadow: '0 0 12px #22d3ee' }}
          />
        </div>
        <div className="mt-3 text-center text-[0.6rem] tracking-widest text-cyan-500/50">
          {loaded ? `${progress}% — click or press Esc to skip` : `${progress}% — loading assets …`}
        </div>
      </div>
    </div>
  );
}
