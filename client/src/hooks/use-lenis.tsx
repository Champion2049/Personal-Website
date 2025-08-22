import { useEffect, useRef } from 'react';

interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  direction?: 'vertical' | 'horizontal';
  smooth?: boolean;
  smoothTouch?: boolean;
}

export function useLenisScroll(options: LenisOptions = {}) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const initLenis = async () => {
      try {
        const { default: Lenis } = await import('lenis');
        
        lenisRef.current = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          smooth: true,
          smoothTouch: false,
          ...options,
        });

        const raf = (time: number) => {
          lenisRef.current?.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        document.documentElement.classList.add('lenis');
      } catch (error) {
        console.warn('Lenis not available');
      }
    };

    initLenis();

    return () => {
      lenisRef.current?.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  return lenisRef.current;
}
