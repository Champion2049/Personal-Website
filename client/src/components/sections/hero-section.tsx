import { motion } from 'framer-motion';
import { animations } from '@/lib/animations';
import LetterGlitch from '@/components/ui/letter-glitch';
import { LogoLoop } from '@/components/ui/logo-loop';
import {
	SiPython,
	SiJavascript,
	SiTypescript,
	SiReact,
	SiNodedotjs,
	SiNextdotjs,
	SiTensorflow,
	SiKeras,
	SiOpencv,
	SiGit,
	SiLinux,
	SiRaspberrypi,
	SiFlask,
	SiDiscord,
	SiC,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

const skills = [
	{
		node: <SiPython className="text-white" />,
		title: 'Python',
		href: 'https://www.python.org',
	},
	{
		node: <SiJavascript className="text-white" />,
		title: 'JavaScript',
		href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
	},
	{
		node: <SiTypescript className="text-white" />,
		title: 'TypeScript',
		href: 'https://www.typescriptlang.org/',
	},
	{
		node: <SiReact className="text-white" />,
		title: 'React',
		href: 'https://react.dev/',
	},
	{
		node: <SiNodedotjs className="text-white" />,
		title: 'Node.js',
		href: 'https://nodejs.org/',
	},
	{
		node: <SiNextdotjs className="text-white" />,
		title: 'Next.js',
		href: 'https://nextjs.org/',
	},
	{
		node: <SiTensorflow className="text-white" />,
		title: 'TensorFlow',
		href: 'https://www.tensorflow.org/',
	},
	{
		node: <SiKeras className="text-white" />,
		title: 'Keras',
		href: 'https://keras.io/',
	},
	{
		node: <SiOpencv className="text-white" />,
		title: 'OpenCV',
		href: 'https://opencv.org/',
	},
	{
		node: <SiGit className="text-white" />,
		title: 'Git',
		href: 'https://git-scm.com/',
	},
	{
		node: <SiLinux className="text-white" />,
		title: 'Linux',
		href: 'https://www.linux.org/',
	},
	{
		node: <SiRaspberrypi className="text-white" />,
		title: 'Raspberry Pi',
		href: 'https://www.raspberrypi.org/',
	},
	{
		node: <SiFlask className="text-white" />,
		title: 'Flask',
		href: 'https://flask.palletsprojects.com/',
	},
	{
		node: <SiDiscord className="text-white" />,
		title: 'Discord.js',
		href: 'https://discord.js.org/',
	},
	{
		node: <FaJava className="text-white" />,
		title: 'Java',
		href: 'https://www.java.com/',
	},
	{
		node: <SiC className="text-white" />,
		title: 'C',
		href: 'https://en.wikipedia.org/wiki/C_(programming_language)',
	},
];

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
      <div className="absolute inset-0 bg-black/30 z-10" />
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

      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 sm:px-8">
        <div className="text-center max-w-6xl mx-auto">
          <div className="hero-text-container">
            <motion.h1 
              className="font-space text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-6 md:mb-8"
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
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 md:mb-12 max-w-3xl mx-auto"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
            data-testid="hero-description"
          >
            AI & Data Science Student | Full-Stack Developer | Machine Learning Enthusiast
          </motion.p>

          <motion.div 
            className="h-24 sm:h-32 md:h-40 relative overflow-hidden mb-10 md:mb-12"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
          >
            <LogoLoop
                logos={skills}
                speed={120}
                direction="left"
                logoHeight={window.innerWidth < 768 ? 32 : 48}
                gap={40}
                pauseOnHover
                scaleOnHover
                fadeOut
                fadeOutColor="hsl(var(--background))"
                ariaLabel="Technology partners"
            />
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
          >
            <button 
              onClick={handleExploreClick}
              className="glass-effect w-full sm:w-auto px-8 py-4 rounded-2xl text-base sm:text-lg font-semibold text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 transform hover:scale-105"
              data-testid="button-explore-work"
            >
              View My Projects
            </button>
            <button 
              onClick={handleContactClick}
              className="glass-effect w-full sm:w-auto px-8 py-4 rounded-2xl text-base sm:text-lg font-semibold text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 transform hover:scale-105"
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
