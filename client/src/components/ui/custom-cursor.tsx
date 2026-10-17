import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { gsap } from '@/lib/gsap';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, label, select, [data-cursor]';
const LOCKABLE = '.panel, .shard, [data-lock]';
const LOCK_PAD = 12;

/**
 * HUD reticle cursor: a dot that tracks the pointer exactly and a crop-handle
 * frame that trails it and opens up over anything clickable. Over a card the
 * frame target-locks: it snaps around the card and rides along with it while
 * the page scrolls. Positioning is transform-only (gsap.quickTo); the lock reads
 * one rect per scroll frame and only while locked.
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
    let locked: Element | null = null;
    let px = -100;
    let py = -100;

    const setHover = (on: boolean) => {
      if (on === hovering) return;
      hovering = on;
      if (locked) gsap.to(dot, { scale: on ? 2.4 : 1, duration: 0.2, overwrite: 'auto' });
      else gsap.to(frame, { scale: on ? 1.7 : 1, rotate: on ? 45 : 0, duration: 0.25, ease: 'power3.out', overwrite: 'auto' });
    };
    const resize = (w: number, h: number) => gsap.to(frame, { width: w, height: h, duration: 0.32, ease: 'power3.out', overwrite: 'auto' });
    // huge panels (whole-section wrappers) aren't worth framing
    const lockable = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.width < window.innerWidth * 0.9 && r.height < window.innerHeight * 0.85;
    };
    const lock = (el: Element) => {
      locked = el;
      hovering = false;
      frame.setAttribute('data-locked', '');
      gsap.to(frame, { scale: 1, rotate: 0, duration: 0.25, ease: 'power3.out', overwrite: 'auto' });
      const r = el.getBoundingClientRect();
      frameX(r.left + r.width / 2);
      frameY(r.top + r.height / 2);
      resize(r.width + LOCK_PAD, r.height + LOCK_PAD);
    };
    const unlock = () => {
      locked = null;
      frame.removeAttribute('data-locked');
      gsap.to(dot, { scale: 1, duration: 0.2, overwrite: 'auto' });
      resize(22, 22);
      frameX(px);
      frameY(py);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      dotX(px);
      dotY(py);
      const target = e.target as Element | null;
      const card = target?.closest?.(LOCKABLE) ?? null;
      if (card !== locked) {
        if (card && lockable(card)) lock(card);
        else if (locked) unlock();
      }
      if (!locked) {
        frameX(px);
        frameY(py);
      }
      setHover(!!target?.closest?.(INTERACTIVE));
    };
    // The page moves under a still pointer: follow the locked card, let go once it slides away.
    const onScroll = () => {
      if (!locked) return;
      const r = locked.getBoundingClientRect();
      if (px < r.left || px > r.right || py < r.top || py > r.bottom) return unlock();
      frameX(r.left + r.width / 2);
      frameY(r.top + r.height / 2);
    };
    const onLeave = () => {
      setHover(false);
      if (locked) unlock();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
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
