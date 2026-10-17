import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Download } from 'lucide-react';
import { TronGrid } from '@/components/ui/tron-grid';
import { useMagnetic } from '@/lib/use-magnetic';
import { useIntroReady } from '@/lib/intro-gate';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

const rise = (delay: number) => ({
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: EASE_OUT } },
});
// Each line of the name rises out of its own clip.
const nameLine = (delay: number) => ({
  hidden: { opacity: 0, y: '35%', clipPath: 'inset(0% 0% 100% 0%)' },
  shown: { opacity: 1, y: '0%', clipPath: 'inset(-25% -10% -35% -10%)', transition: { duration: 0.8, delay, ease: EASE_OUT } },
});
const TRAIL = { duration: 0.9, delay: 0.5, ease: EASE_IN_OUT };

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

export function HeroSection() {
  const typed = useTypewriter(roles);
  const magProjects = useMagnetic();
  const magResume = useMagnetic();
  const reduce = useReducedMotion();
  const ready = useIntroReady();
  // Wait for the boot overlay to lift, so the entrance is actually seen.
  const state = reduce || ready ? 'shown' : 'hidden';

  return (
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
        <motion.div className="max-w-3xl mx-auto text-center flex flex-col items-center" initial={false} animate={state}>
            <motion.div
              variants={rise(0)}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="font-mono text-xs tracking-wide text-muted-foreground">
                Open to internships &amp; research collaborations
              </span>
            </motion.div>

            <h1 className="mt-7 font-space text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight">
              <motion.span className="block" variants={nameLine(0.1)}>Chirayu</motion.span>
              <motion.span className="block" variants={nameLine(0.2)}>
                <span className="text-morphing">Chaudhari</span>
              </motion.span>
            </h1>

            {/* A light-cycle streaks under the name and leaves its trail behind */}
            <div aria-hidden className="relative mt-5 h-px w-[min(26rem,80%)]">
              <motion.span
                className="absolute inset-0 origin-left bg-gradient-to-r from-transparent via-primary to-transparent"
                variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: TRAIL } }}
              />
              <motion.span
                className="absolute top-1/2 -ml-3 h-1 w-6 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_#22d3ee,0_0_22px_#22d3ee]"
                variants={{
                  hidden: { left: '0%', opacity: 0 },
                  shown: { left: '100%', opacity: [0, 1, 1, 0], transition: TRAIL },
                }}
              />
            </div>

            <motion.div
              className="mt-5 h-8 font-mono text-lg md:text-xl text-muted-foreground"
              variants={rise(0.75)}
            >
              <span className="text-primary">&gt;</span> {typed}
              <span className="ml-0.5 inline-block w-2.5 h-5 translate-y-1 bg-primary animate-pulse" />
            </motion.div>

            <motion.p
              className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed"
              variants={rise(0.85)}
            >
              Third-year AI &amp; Data Science student building at the intersection of
              machine learning, full-stack systems, and hardware. Published author with a passion for open-source, game development, and all things sci-fi.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
              variants={rise(0.95)}
            >
              <button
                ref={magProjects.ref as any}
                onMouseMove={magProjects.onMouseMove}
                onMouseLeave={magProjects.onMouseLeave}
                onClick={() => scrollTo('#projects')}
                className="magnetic press btn-shine group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-medium text-primary-foreground animate-pulse-glow"
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
                className="magnetic press inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 font-medium hover:border-primary/50 hover:text-primary"
              >
                <Download size={18} /> Résumé
              </a>
            </motion.div>

            <motion.div
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border/60"
              variants={rise(1.05)}
            >
              {stats.map((s) => (
                <div key={s.label} className="bg-background px-5 py-5 text-center sm:text-left">
                  <div className="font-space text-2xl md:text-3xl font-bold accent-text">{s.value}</div>
                  <div className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>
        </motion.div>
      </div>

      <button
        onClick={() => scrollTo('#about')}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <span className="font-mono text-[0.65rem] tracking-[0.3em] uppercase">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-primary to-transparent" />
      </button>
    </section>
  );
}

