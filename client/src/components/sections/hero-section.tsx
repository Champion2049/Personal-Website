import { motion } from 'framer-motion';
import { animations } from '@/lib/animations';
import LetterGlitch from '@/components/ui/letter-glitch';

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
    <section id="home" className="min-h-screen relative overflow-hidden bg-background">
      {/* Letter Glitch Canvas Background (React Bits style) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          glitchColors={["#00ff41", "#00ff85", "#39ff14"]}
          className="w-full h-full"
        />
      </div>

      <div className="relative z-20 flex items-center justify-center min-h-screen px-8">
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
  {/* Removed heavy floating shapes to improve performance */}
    </section>
  );
}
