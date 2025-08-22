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
    <>
      <motion.div 
        className="fixed top-0 left-0 bg-gradient-to-r from-primary to-orange-400 z-50 transition-all duration-300"
        style={{ width: `${progress}%` }}
        animate={{ 
          height: isScrolling ? 4 : 2,
          opacity: isScrolling ? 1 : 0.8
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      
      {/* Cool scroll indicator */}
      <motion.div
        className="fixed top-6 right-6 z-40 w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm"
        animate={{ 
          scale: isScrolling ? 1.1 : 1,
          borderColor: isScrolling ? 'rgb(234, 88, 12)' : 'rgba(234, 88, 12, 0.3)',
          backgroundColor: isScrolling ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }}
        transition={{ duration: 0.2 }}
        style={{ 
          display: progress > 5 ? 'flex' : 'none' 
        }}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
          animate={{
            scale: progress / 100 * 1.2 + 0.6
          }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>
    </>
  );
}
