import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { animations } from '@/lib/animations';

export function HeroSection() {
  const handleExploreClick = () => {
    const element = document.querySelector('#projects');
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const handleContactClick = () => {
    const element = document.querySelector('#contact');
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="min-h-screen relative overflow-hidden neural-grid">
      <div className="absolute inset-0 z-0 holographic-bg" />
      
      {/* Floating geometric particles */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-8">
        <div className="text-center max-w-6xl mx-auto">
          <div className="hero-text-container">
            <motion.h1 
              className="font-space text-6xl md:text-8xl lg:text-9xl font-bold mb-8"
              initial="initial"
              animate="animate"
              variants={{
                animate: {
                  transition: {
                    staggerChildren: 0.3
                  }
                }
              }}
            >
              <motion.span 
                className="text-morphing block"
                variants={animations.morphText}
                data-testid="hero-title-line-1"
              >
                CHIRAYU
              </motion.span>
              <motion.span 
                className="text-morphing block"
                variants={animations.morphText}
                data-testid="hero-title-line-2"
              >
                CHAUDHARI
              </motion.span>
            </motion.h1>
          </div>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
            data-testid="hero-description"
          >
            AI & Data Science Student | Full-Stack Developer | Machine Learning Enthusiast
            <br />
            <span className="text-lg opacity-80">Kinda bored usually, but try to do stuff</span>
          </motion.p>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
          >
            <button 
              onClick={handleExploreClick}
              className="glass-effect px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-500 transform hover:scale-105 animate-pulse-glow"
              data-testid="button-explore-work"
            >
              View My Projects
            </button>
            <button 
              onClick={handleContactClick}
              className="border border-primary px-8 py-4 rounded-2xl text-lg font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 transform hover:scale-105"
              data-testid="button-get-in-touch"
            >
              Get In Touch
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced floating geometric shapes with warm colors */}
      <motion.div 
        className="absolute top-20 left-20 w-20 h-20 border-2 border-orange-400 rounded-full opacity-50"
        variants={animations.floatingCard}
        animate="animate"
        style={{ 
          background: 'linear-gradient(45deg, rgba(255, 140, 80, 0.15), rgba(255, 100, 50, 0.15))',
          boxShadow: '0 0 40px rgba(255, 140, 80, 0.4)'
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg opacity-70 animate-morph"
        variants={animations.floatingCard}
        animate="animate"
        style={{ 
          animationDelay: '1s',
          boxShadow: '0 0 30px rgba(255, 100, 50, 0.5)'
        }}
      />
      <motion.div 
        className="absolute top-1/2 right-10 w-12 h-12 border-2 border-yellow-400 transform rotate-45 opacity-60"
        variants={animations.floatingCard}
        animate="animate"
        style={{ 
          animationDelay: '2s',
          boxShadow: '0 0 20px rgba(255, 180, 100, 0.4)'
        }}
      />
      <motion.div 
        className="absolute top-32 right-32 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-50"
        variants={animations.floatingCard}
        animate="animate"
        style={{ 
          animationDelay: '3s',
          boxShadow: '0 0 25px rgba(255, 150, 80, 0.4)'
        }}
      />
    </section>
  );
}
