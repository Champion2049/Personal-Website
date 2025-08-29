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
		node: <SiPython />,
		title: 'Python',
		href: 'https://www.python.org',
	},
	{
		node: <SiJavascript />,
		title: 'JavaScript',
		href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
	},
	{
		node: <SiTypescript />,
		title: 'TypeScript',
		href: 'https://www.typescriptlang.org/',
	},
	{
		node: <SiReact />,
		title: 'React',
		href: 'https://react.dev/',
	},
	{
		node: <SiNodedotjs />,
		title: 'Node.js',
		href: 'https://nodejs.org/',
	},
	{
		node: <SiNextdotjs />,
		title: 'Next.js',
		href: 'https://nextjs.org/',
	},
	{
		node: <SiTensorflow />,
		title: 'TensorFlow',
		href: 'https://www.tensorflow.org/',
	},
	{
		node: <SiKeras />,
		title: 'Keras',
		href: 'https://keras.io/',
	},
	{
		node: <SiOpencv />,
		title: 'OpenCV',
		href: 'https://opencv.org/',
	},
	{
		node: <SiGit />,
		title: 'Git',
		href: 'https://git-scm.com/',
	},
	{
		node: <SiLinux />,
		title: 'Linux',
		href: 'https://www.linux.org/',
	},
	{
		node: <SiRaspberrypi />,
		title: 'Raspberry Pi',
		href: 'https://www.raspberrypi.org/',
	},
	{
		node: <SiFlask />,
		title: 'Flask',
		href: 'https://flask.palletsprojects.com/',
	},
	{
		node: <SiDiscord />,
		title: 'Discord.js',
		href: 'https://discord.js.org/',
	},
	{
		node: <FaJava />,
		title: 'Java',
		href: 'https://www.java.com/',
	},
	{
		node: <SiC />,
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
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-full mx-auto"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
            data-testid="hero-description"
          >
            AI & Data Science Student | Full-Stack Developer | Machine Learning Enthusiast
            <br />
            <div style={{ height: '200px', position: 'relative', overflow: 'hidden'}}>
                <LogoLoop
                    logos={skills}
                    speed={120}
                    direction="left"
                    logoHeight={48}
                    gap={40}
                    pauseOnHover
                    scaleOnHover
                    fadeOut
                    fadeOutColor="hsl(var(--background))"
                    ariaLabel="Technology partners"
                />
                </div>
          </motion.p>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
          >
            <button 
              onClick={handleExploreClick}
              className="glass-effect px-8 py-4 rounded-2xl text-lg font-semibold text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 transform hover:scale-105"
              data-testid="button-explore-work"
            >
              View My Projects
            </button>
            <button 
              onClick={handleContactClick}
              className="glass-effect px-8 py-4 rounded-2xl text-lg font-semibold text-white hover:bg-primary hover:text-primary-foreground transition-all duration-500 transform hover:scale-105"
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
