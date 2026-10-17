import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Smooth scrolling, driven by GSAP's ticker so Lenis and ScrollTrigger share
 * one animation loop (instead of two competing requestAnimationFrame loops),
 * and ScrollTrigger is told about every Lenis scroll update.
 */
const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

export function LenisScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({ lerp: 0.13, wheelMultiplier: 1, touchMultiplier: 2, smoothWheel: true });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    // Async content (GitHub repos, guestbook…) changes the page height after
    // ScrollTriggers measured it; re-measure when the document actually grows/shrinks.
    let lastHeight = document.documentElement.scrollHeight;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const h = document.documentElement.scrollHeight;
        if (Math.abs(h - lastHeight) > 2) {
          lastHeight = h;
          ScrollTrigger.refresh();
        }
      }, 250);
    });
    ro.observe(document.body);

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      gsap.ticker.remove(tick);
      instance.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
