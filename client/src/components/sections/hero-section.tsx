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

export function HeroSection() {
  const typed = useTypewriter(roles);
  const magProjects = useMagnetic();
  const magResume = useMagnetic();

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
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
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

