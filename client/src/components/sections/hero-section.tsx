<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Download } from 'lucide-react';
import { TronGrid } from '@/components/ui/tron-grid';
import { useMagnetic } from '@/lib/use-magnetic';

const roles = [
  'AI Engineering Intern',
  'Full-Stack Developer',
  'ML & Signal Processing',
  'Published IEEE Author',
  'ICPC Regionalist',
];

const stats = [
  { value: '9.33', label: 'CGPA' },
  { value: '3', label: 'Publications' },
  { value: 'Top 6', label: 'Novo Nordisk' },
  { value: 'ICPC', label: 'Regionalist' },
];

function useTypewriter(words: string[]) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const done = text === current;
    const empty = text === '';

    let delay = deleting ? 45 : 80;
    if (done && !deleting) delay = 1600;
    if (empty && deleting) delay = 300;

    const t = setTimeout(() => {
      if (!deleting && done) {
        setDeleting(true);
      } else if (deleting && empty) {
        setDeleting(false);
        setWordIndex((i) => i + 1);
      } else {
        setText(current.substring(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(t);
  }, [text, deleting, wordIndex, words]);

  return text;
}

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
=======
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
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50

export function HeroSection() {
  const typed = useTypewriter(roles);
  const magProjects = useMagnetic();
  const magResume = useMagnetic();

  return (
<<<<<<< HEAD
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_78%)]">
        <TronGrid color="#22d3ee" />
      </div>
      <div className="glow-blob animate-blob" style={{ width: 480, height: 480, top: '-8%', left: '-6%', background: 'radial-gradient(circle, hsl(192 100% 55% / 0.45), transparent 70%)' }} />
      <div className="glow-blob animate-blob" style={{ width: 420, height: 420, bottom: '-10%', right: '-4%', background: 'radial-gradient(circle, hsl(212 100% 58% / 0.3), transparent 70%)', animationDelay: '6s' }} />

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40 animate-float"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animationDelay: `${i % 6}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 md:px-10 relative z-10 pt-28 pb-16">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm"
=======
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
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="font-mono text-xs tracking-wide text-muted-foreground">
                Open to internships &amp; research collaborations
              </span>
            </motion.div>

            <motion.h1
              className="mt-7 font-space text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Chirayu
              <br />
              <span className="text-morphing">Chaudhari</span>
            </motion.h1>
<<<<<<< HEAD

            <motion.div
              className="mt-6 h-8 font-mono text-lg md:text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-primary">&gt;</span> {typed}
              <span className="ml-0.5 inline-block w-2.5 h-5 translate-y-1 bg-primary animate-pulse" />
            </motion.div>

            <motion.p
              className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
=======
          </div>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 md:mb-12 max-w-3xl mx-auto"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
            data-testid="hero-description"
          >
            <span className="block">AI & Data Science Student | Full-Stack Developer | ML Enthusiast</span>
            <span className="block">Probably building something stupid cause I can</span>
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
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
            >
              Third-year AI &amp; Data Science student building at the intersection of
              machine learning, full-stack systems, and hardware. Published author with a passion for open-source, game development, and all things sci-fi.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
            >
              <button
                ref={magProjects.ref as any}
                onMouseMove={magProjects.onMouseMove}
                onMouseLeave={magProjects.onMouseLeave}
                onClick={() => scrollTo('#projects')}
                className="magnetic btn-shine group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-medium text-primary-foreground animate-pulse-glow"
              >
                View Projects
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <a
                ref={magResume.ref as any}
                onMouseMove={magResume.onMouseMove}
                onMouseLeave={magResume.onMouseLeave}
                href="/Chirayu_Chaudhari_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 font-medium transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Download size={18} /> Résumé
              </a>
            </motion.div>

            <motion.div
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border/60"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {stats.map((s) => (
                <div key={s.label} className="bg-background px-5 py-5 text-center sm:text-left">
                  <div className="font-space text-2xl md:text-3xl font-bold accent-text">{s.value}</div>
                  <div className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>
        </div>
      </div>
<<<<<<< HEAD

      <button
        onClick={() => scrollTo('#about')}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <span className="font-mono text-[0.65rem] tracking-[0.3em] uppercase">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-primary to-transparent" />
      </button>
=======
      
      {/* Enhanced floating geometric shapes with warm colors */}
  {/* Removed heavy floating shapes to improve performance */}
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
    </section>
  );
}

