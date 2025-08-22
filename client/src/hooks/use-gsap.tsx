import { useEffect, useRef } from 'react';

export function useGSAPAnimation() {
  const timelineRef = useRef<any>(null);

  useEffect(() => {
    const initGSAP = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        
        gsap.registerPlugin(ScrollTrigger);
        timelineRef.current = gsap.timeline();
        
        return gsap;
      } catch (error) {
        console.warn('GSAP not available');
        return null;
      }
    };

    initGSAP();
  }, []);

  return timelineRef.current;
}
