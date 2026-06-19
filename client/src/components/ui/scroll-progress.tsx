import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxHeight > 0 ? Math.min((scrolled / maxHeight) * 100, 100) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-0.5 bg-gradient-to-r from-primary to-blue-500 transition-[width] duration-150 ease-out"
      style={{ width: `${progress}%` }}
    />
  );
}
