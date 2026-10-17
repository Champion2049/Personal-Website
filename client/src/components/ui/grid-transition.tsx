import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { holdIntro, releaseIntro } from '@/lib/intro-gate';

/**
 * Full-screen TRON light-cycle transition. Plays automatically whenever the
 * route crosses INTO or OUT OF /about-me, however navigation happened.
 * The bike art is a recolored silhouette (public/tron-bike-mask.png) tinted via
 * a CSS mask — cyan entering, crimson leaving — with its trail baked in.
 */
const CYAN = '#22d3ee';
const CRIMSON = '#ff3a2e';
const isAboutPath = (p: string) => p.startsWith('/about-me');

export function GridTransition() {
  const [active, setActive] = useState(false);
  const [crossed, setCrossed] = useState(false);
  const [flash, setFlash] = useState(false);
  const reverse = useRef(false);
  const [location, setLocation] = useLocation();
  const prev = useRef(location);

  useEffect(() => {
    const onEnter = (e: Event) => {
      const to = (e as CustomEvent).detail?.to || '/about-me';
      setLocation(to);
    };
    window.addEventListener('enter-grid', onEnter as EventListener);
    return () => window.removeEventListener('enter-grid', onEnter as EventListener);
  }, [setLocation]);

  useLayoutEffect(() => {
    const wasAbout = isAboutPath(prev.current);
    const nowAbout = isAboutPath(location);
    prev.current = location;
    if (wasAbout === nowAbout) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    reverse.current = wasAbout;
    holdIntro('grid-transition');
    window.scrollTo(0, 0);
    setCrossed(false);
    setFlash(false);
    setActive(true);
  }, [location]);

  // Let the destination page's entrance play as the overlay fades away.
  useEffect(() => {
    if (!active) releaseIntro('grid-transition');
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setCrossed(true), 1150);
    const t2 = setTimeout(() => setFlash(true), 1750);
    const t3 = setTimeout(() => setActive(false), 2550);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [active]);

  const skip = () => setActive(false);

  const rev = reverse.current;
  const showRed = rev ? !crossed : crossed;
  const c = showRed ? CRIMSON : CYAN;
  const flashColor = rev ? CYAN : CRIMSON;
  const caption = rev
    ? (crossed ? '// back to the grid' : 'leaving night city')
    : (crossed ? '// entering night city' : 'entering the grid');

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden cursor-pointer select-none"
          style={{ background: '#03040a' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={skip}
        >
          {/* Perspective grid floor */}
          <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ perspective: '320px' }}>
            <div
              className="absolute inset-0 origin-bottom overflow-hidden"
              style={{
                transform: 'rotateX(70deg)',
                maskImage: 'linear-gradient(to top, black, transparent 85%)',
                WebkitMaskImage: 'linear-gradient(to top, black, transparent 85%)',
              }}
            >
              {/* moved by whole 60px tiles with a transform: no per-frame repaint */}
              <div
                className="absolute inset-x-0 bottom-0 animate-[grid-rush-t_0.3s_linear_infinite]"
                style={{
                  top: -600,
                  backgroundImage: `linear-gradient(to right, ${c}55 1px, transparent 1px), linear-gradient(to bottom, ${c}55 1px, transparent 1px)`,
                  backgroundSize: '60px 60px',
                }}
              />
            </div>
          </div>

          {/* Horizon glow */}
          <div
            className="absolute left-0 right-0 top-1/2 h-40 -translate-y-1/2"
            style={{ background: `radial-gradient(ellipse at center, ${c}33, transparent 70%)`, transition: 'background 0.5s ease' }}
          />

          {/* Ambient speed lines */}
          {[34, 42, 58, 66].map((top, i) => (
            <motion.div
              key={top}
              className="absolute h-px"
              style={{ top: `${top}%`, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, transition: 'background 0.5s ease' }}
              initial={{ left: rev ? '-50%' : '110%', width: '40%', opacity: 0 }}
              animate={{ left: rev ? '110%' : '-50%', opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity, ease: 'linear' }}
            />
          ))}

          {/* The recolored light-cycle (image silhouette + baked-in trail) */}
          <motion.div
            className="absolute top-1/2"
            style={{ transform: rev ? 'translateY(-50%) scaleX(-1)' : 'translateY(-50%)' }}
            initial={{ left: rev ? '120vw' : '-55vw' }}
            animate={{ left: rev ? '-55vw' : '120vw' }}
            transition={{ duration: 2.2, ease: [0.35, 0, 0.5, 1] }}
          >
            {/* Extended light-wall trail — matched to the image's trail band (y 142-192 of 316) */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '45%',
                height: '15.8%',
                right: 'calc(100% - 14px)',
                width: '140vw',
                backgroundColor: c,
                boxShadow: `0 0 18px ${c}`,
                transition: 'background-color 0.5s ease, box-shadow 0.5s ease',
              }}
            />
            <div
              style={{
                width: 'min(62vw, 480px)',
                aspectRatio: '404 / 316',
                backgroundColor: c,
                WebkitMaskImage: 'url(/tron-bike-mask.png)',
                maskImage: 'url(/tron-bike-mask.png)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                filter: `drop-shadow(0 0 7px ${c}) drop-shadow(0 0 18px ${c})`,
                transition: 'background-color 0.5s ease, filter 0.5s ease',
              }}
            />
          </motion.div>

          {/* Caption */}
          <div className="absolute inset-x-0 top-[15%] text-center px-6">
            <motion.p
              className={`font-mono text-sm tracking-[0.4em] uppercase ${showRed ? 'animate-glitch' : ''}`}
              style={{ color: c, transition: 'color 0.5s ease' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {caption}
            </motion.p>
            <p className="mt-2 font-mono text-[0.65rem] text-white/40">click to skip</p>
          </div>

          {/* Flash on cross-over */}
          <AnimatePresence>
            {flash && (
              <motion.div
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at center, ${flashColor}, ${flashColor}00 70%)` }}
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: [0, 0.9, 0.2], scale: 3 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
