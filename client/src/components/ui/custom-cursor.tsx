import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const outlinePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.left = mousePos.current.x + 'px';
        dotRef.current.style.top = mousePos.current.y + 'px';
      }
    };

    const animateOutline = () => {
      const factor = 0.1;
      outlinePos.current.x += (mousePos.current.x - outlinePos.current.x) * factor;
      outlinePos.current.y += (mousePos.current.y - outlinePos.current.y) * factor;
      
      if (outlineRef.current) {
        outlineRef.current.style.left = (outlinePos.current.x - 15) + 'px';
        outlineRef.current.style.top = (outlinePos.current.y - 15) + 'px';
      }
      
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
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animateOutline);

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [data-testid*="button"], [data-testid*="link"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={outlineRef} className="cursor-outline" />
    </>
  );
}
