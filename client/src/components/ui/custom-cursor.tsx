import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { gsap } from '@/lib/gsap';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, label, select, [data-cursor]';

/**
 * HUD reticle cursor: a dot that tracks the pointer exactly and a crop-handle
 * frame that trails it and opens up over anything clickable.
 * Transform-only (gsap.quickTo), no per-frame layout reads or writes, and
 * GSAP's ticker idles once the frame has caught up.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [location] = useLocation();
  const color = location.startsWith('/about-me') ? '#ff3a2e' : '#00e5ff';

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const frame = frameRef.current;
    if (!enabled || !dot || !frame) return;
    document.documentElement.classList.add('custom-cursor-active');

    gsap.set([dot, frame], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dotX = gsap.quickSetter(dot, 'x', 'px');
    const dotY = gsap.quickSetter(dot, 'y', 'px');
    const frameX = gsap.quickTo(frame, 'x', { duration: 0.22, ease: 'power3' });
    const frameY = gsap.quickTo(frame, 'y', { duration: 0.22, ease: 'power3' });

    let hovering = false;
    const setHover = (on: boolean) => {
      if (on === hovering) return;
      hovering = on;
      gsap.to(frame, { scale: on ? 1.7 : 1, rotate: on ? 45 : 0, duration: 0.25, ease: 'power3.out', overwrite: 'auto' });
    };

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      frameX(e.clientX);
      frameY(e.clientY);
      setHover(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
    };
    const onLeave = () => setHover(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={frameRef} aria-hidden className="cursor-frame" style={{ color }}>
        <span /><span /><span /><span />
      </div>
      <div ref={dotRef} aria-hidden className="cursor-dot" style={{ background: color }} />
    </>
  );
}
