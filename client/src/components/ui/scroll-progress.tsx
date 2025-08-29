import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 200);
      
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrolled / maxHeight) * 100;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <motion.div 
      className="fixed top-0 left-0 bg-primary z-50 transition-all duration-300"
      style={{ width: `${progress}%` }}
      animate={{ 
        height: isScrolling ? 4 : 2,
        opacity: isScrolling ? 1 : 0.8
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  );
}
