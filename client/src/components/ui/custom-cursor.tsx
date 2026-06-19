import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, label, select, [data-cursor]';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const outlinePos = useRef({ x: 0, y: 0 });
  const colorRef = useRef('#22d3ee');
  const hoverRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [location] = useLocation();

  // Cyan on the main site, crimson on the Night City page — morphs on route change.
  const color = location.startsWith('/about-me') ? '#ff2056' : '#22d3ee';

  useEffect(() => {
    colorRef.current = color;
    if (dotRef.current) {
      dotRef.current.style.background = color;
      dotRef.current.style.boxShadow = `0 0 14px ${color}cc`;
    }
    if (outlineRef.current) {
      outlineRef.current.style.borderColor = color + (hoverRef.current ? 'e6' : '66');
    }
  }, [color]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
    document.documentElement.classList.add('custom-cursor-active'); // hides the OS cursor

    const setHover = (on: boolean) => {
      if (hoverRef.current === on) return;
      hoverRef.current = on;
      if (outlineRef.current) {
        outlineRef.current.style.transform = on ? 'scale(1.8)' : 'scale(1)';
        outlineRef.current.style.borderColor = colorRef.current + (on ? 'e6' : '66');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };

    const handleMouseLeaveWindow = () => setHover(false);

    let raf = 0;
    let frame = 0;
    const animate = () => {
      const factor = 0.18;
      outlinePos.current.x += (mousePos.current.x - outlinePos.current.x) * factor;
      outlinePos.current.y += (mousePos.current.y - outlinePos.current.y) * factor;
      if (outlineRef.current) {
        outlineRef.current.style.left = outlinePos.current.x - 13 + 'px';
        outlineRef.current.style.top = outlinePos.current.y - 13 + 'px';
      }
<<<<<<< HEAD
      // Re-evaluate hover from what's ACTUALLY under the pointer, every few frames.
      // Using elementFromPoint (not the last mousemove target) means the ring
      // shrinks back even when the DOM changes under a stationary cursor —
      // e.g. async content loads, overlays open/close, or a link unmounts.
      if ((frame++ & 7) === 0) {
        const el = document.elementFromPoint(mousePos.current.x, mousePos.current.y);
        setHover(!!(el && el.closest && el.closest(INTERACTIVE)));
=======
      
      requestAnimationFrame(animateOutline);
    };

    const handleMouseEnter = () => {
      if (outlineRef.current) {
        outlineRef.current.style.transform = 'scale(2.5)';
      }
    };

    const handleMouseLeave = () => {
      if (outlineRef.current) {
        outlineRef.current.style.transform = 'scale(1)';
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
      }
      raf = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ background: color, boxShadow: `0 0 14px ${color}cc` }} />
      <div ref={outlineRef} className="cursor-outline" style={{ borderColor: color + '66' }} />
    </>
  );
}
