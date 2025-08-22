import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface LenisInstance {
  scrollTo: (target: string | HTMLElement, options?: any) => void;
  on: (event: string, callback: (data: any) => void) => any;
  raf: (time: number) => void;
  destroy: () => void;
}

const LenisContext = createContext<LenisInstance | null>(null);

export const useLenis = () => {
  const context = useContext(LenisContext);
  if (!context) {
    // Return fallback instead of throwing error
    return {
      scrollTo: (target: string | HTMLElement) => {
        if (typeof target === 'string') {
          const element = document.querySelector(target);
          element?.scrollIntoView({ behavior: 'smooth' });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      },
      on: () => {},
      raf: () => {},
      destroy: () => {},
    };
  }
  return context;
};

interface LenisScrollProviderProps {
  children: ReactNode;
}

export function LenisScrollProvider({ children }: LenisScrollProviderProps) {
  const lenisRef = useRef<LenisInstance | null>(null);
  const [lenisInstance, setLenisInstance] = useState<LenisInstance | null>(null);

  useEffect(() => {
    const initLenis = async () => {
      try {
        // Dynamically import Lenis
        const { default: Lenis } = await import('lenis');
        
        const lenis = new Lenis({
          duration: 1.8,
          easing: (t: number) => {
            // Custom easing function inspired by darkroom.engineering
            return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
          },
          lerp: 0.08,
          smooth: true,
          smoothTouch: false,
          wheelMultiplier: 0.8,
          touchMultiplier: 2,
        }) as any;

        lenisRef.current = lenis;
        setLenisInstance(lenis);

        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // Add lenis class to html
        document.documentElement.classList.add('lenis');
      } catch (error) {
        console.warn('Lenis not available, falling back to native scroll');
        // Fallback to native scrolling
        const fallback = {
          scrollTo: (target: string | HTMLElement) => {
            if (typeof target === 'string') {
              const element = document.querySelector(target);
              element?.scrollIntoView({ behavior: 'smooth' });
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          },
          on: () => {},
          raf: () => {},
          destroy: () => {},
        };
        lenisRef.current = fallback;
        setLenisInstance(fallback);
      }
    };

    initLenis();

    return () => {
      if (lenisRef.current && 'destroy' in lenisRef.current) {
        lenisRef.current.destroy();
        document.documentElement.classList.remove('lenis');
      }
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
