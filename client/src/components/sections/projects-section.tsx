import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useLenis } from '@/components/ui/lenis-scroll-provider';

type Category = 'AI / ML' | 'Signals & Hardware' | 'Web & Systems' | 'Research';

interface Project {
  title: string;
  description: string;
  tags: string[];
  period: string;
  github: string;
  category: Category;
  featured?: boolean;
}

const projectsData: Project[] = [
  {
    title: 'Suspicious Signal Detection — ML & SDR',
    description: 'Dual-layer RF anomaly-detection pipeline using ADALM-PLUTO for I/Q capture in ISM bands. Built a synthetic QPSK-burst generator and benchmarked SVM/Random-Forest classifiers against a custom PyTorch 1D-CNN on raw I/Q.',
    tags: ['PyTorch', 'SDR', 'DSP'],
    period: 'Nov 2025 – Dec 2025',
    github: 'https://github.com/Champion2049/SuspiciousSignal-ML-SDR',
    category: 'Signals & Hardware',
    featured: true,
  },
  {
    title: 'Thermoelectric Energy Optimization with Deep RL',
    description: 'A Gymnasium-compatible thermoelectric-generator environment with Optuna-tuned PPO, A2C, DDPG, SAC and DQN agents in Stable-Baselines3 — producing benchmark comparisons and reusable training utilities. Accepted in a Springer Nature journal.',
    tags: ['RL', 'Stable-Baselines3', 'Optuna'],
    period: 'Aug 2025 – Sep 2025',
    github: 'https://github.com/ShreyaKunda/Thermoelectric-Energy-Optimization-with-Deep-Reinforcement-Learning',
    category: 'AI / ML',
    featured: true,
  },
  {
    title: 'LLM-Optimized Gold Nanoparticle Synthesis',
    description: 'A system pairing the Gemini API with a Keras model to optimize AuNP synthesis for cancer treatment — predicting nanoparticle properties from parameters and using the LLM to suggest process improvements.',
    tags: ['Keras', 'Gemini API', 'Python'],
    period: 'Jan 2025 – Jul 2025',
    github: 'https://github.com/Champion2049/LLM_Optimized_Synth_AuNP',
    category: 'AI / ML',
    featured: true,
  },
  {
    title: 'Facial Emotion Recognition on KDEF',
    description: 'A reusable pipeline contrasting HOG+LinearSVC baselines with fine-tuned CNN backbones on the KDEF dataset, with packaged utilities for loaders, feature builders and training controls, plus automated metrics, reports and exports.',
    tags: ['CNN', 'OpenCV', 'scikit-learn'],
    period: 'Oct 2025 – Nov 2025',
    github: 'https://github.com/Champion2049/AIML_ImageClass',
    category: 'AI / ML',
    featured: true,
  },
  {
    title: 'Energy Conservation with Custom LWT',
    description: 'A Lifting Wavelet Transform implemented from scratch for preprocessing, fed into a custom neural network for energy-consumption analysis — with a UI for applying the LWT to arbitrary N-D datasets.',
    tags: ['Signal Processing', 'Neural Nets', 'UI'],
    period: 'Jan 2025 – Jul 2025',
    github: 'https://github.com/Champion2049/EnergyCons',
    category: 'Signals & Hardware',
  },
  {
    title: 'Lightweight Vehicle Tracking System',
    description: 'Contour vs Hough Transform algorithms for autonomous RC-car path following, with real-time video processing and motor control on a Raspberry Pi. Findings published at an IEEE conference.',
    tags: ['OpenCV', 'Raspberry Pi', 'IEEE'],
    period: 'Oct 2024 – Feb 2025',
    github: 'https://github.com/Champion2049/Contour_vs_Hough',
    category: 'Signals & Hardware',
  },
  {
    title: 'Gesture-Based Hill Climb Racing',
    description: 'A MediaPipe + OpenCV project to play Hill Climb Racing with hand gestures — open palm for gas, fist for brake — mapping real-time landmark detection to game controls.',
    tags: ['MediaPipe', 'OpenCV', 'Python'],
    period: 'Aug 2025',
    github: 'https://github.com/Champion2049/Hill_Climb_GestureBased',
    category: 'AI / ML',
  },
  {
    title: 'Psychoactive Substances ML Classification',
    description: 'A multi-stage ML application with a Flask frontend predicting substance use from personality traits and classifying substances by chemical properties. Accepted at IEEE CSITSS 2025.',
    tags: ['Flask', 'Machine Learning', 'Python'],
    period: 'Sep 2024 – Jun 2025',
    github: 'https://github.com/Champion2049/PsychoactiveFusionML',
    category: 'AI / ML',
  },
  {
    title: 'Molecular Dynamics: Polymer Analysis',
    description: 'Molecular-dynamics simulations of a polymer with GROMACS and comprehensive trajectory analysis via MDAnalysis to assess structural stability and flexibility.',
    tags: ['GROMACS', 'MDAnalysis', 'Python'],
    period: 'Nov 2024',
    github: 'https://github.com/Champion2049/MolecularDynamics',
    category: 'Research',
  },
  {
    title: 'Hack Flappy Bird',
    description: 'A Flappy Bird built in the Jack language with procedural world generation and power-ups, designed to run on the Nand2Tetris Hack computer.',
    tags: ['Jack', 'Game Dev', 'Nand2Tetris'],
    period: 'Jan 2025 – May 2025',
    github: 'https://github.com/Champion2049/HackFlappyBird',
    category: 'Web & Systems',
  },
  {
    title: 'Discord Bot',
    description: 'A multi-functional Discord bot in Node.js with discord.js — music playback from YouTube, user management and message moderation.',
    tags: ['Node.js', 'discord.js', 'APIs'],
    period: '2020 – 2022',
    github: 'https://github.com/Champion2049/Discord_Bot',
    category: 'Web & Systems',
  },
];

const filters: ('All' | Category)[] = ['All', 'AI / ML', 'Signals & Hardware', 'Web & Systems', 'Research'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Large screens with motion allowed get the pinned horizontal gallery; everything else keeps the grid. */
function useGalleryMode() {
  const query = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setOn(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return on;
}

function ProjectCard({ project, className = '' }: { project: Project; className?: string }) {
  const n = projectsData.indexOf(project) + 1;
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-2.5">
        <span className="hud-label">
          P/{pad(n)} <span className="text-muted-foreground/60">//</span> {project.category}
        </span>
        <span className="whitespace-nowrap font-mono text-[0.65rem] text-muted-foreground">{project.period}</span>
      </div>

      <div className={`relative flex flex-1 flex-col p-5 ${className}`}>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 right-4 select-none font-display text-[6.5rem] font-extrabold leading-none text-transparent opacity-70 [-webkit-text-stroke:1px_var(--line)] transition-[-webkit-text-stroke-color] duration-300 group-hover:[-webkit-text-stroke-color:hsl(186_100%_50%/0.35)]"
        >
          {pad(n)}
        </span>
        {project.featured && <span className="signal-tag mb-3 self-start">Featured</span>}
        <h3 className="relative font-display text-xl font-bold uppercase leading-snug tracking-wide transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span key={t} className="tag-chip text-foreground/75">{t}</span>
          ))}
        </div>
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="group/link flex items-center justify-between border-t border-[var(--line)] px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <span className="inline-flex items-center gap-2"><Github size={14} /> Source</span>
        <ArrowUpRight size={15} className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
      </a>
    </>
  );
}

/**
 * Pinned horizontal gallery: vertical scroll drives the track sideways, the
 * track leans into fast scrolling (velocity skew) and each card swings in as it
 * crosses the right edge. Transform-only; rebuilt whenever the filter changes.
 */
function Gallery({ items, active, filtersBar }: { items: Project[]; active: string; filtersBar: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const track = el.querySelector<HTMLElement>('[data-track]')!;
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', el);
      const lane = track.parentElement!;
      // pan until the last card's right edge meets the container's right edge
      const distance = () => {
        const cs = getComputedStyle(lane);
        return Math.max(0, track.offsetWidth - (lane.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)));
      };
      if (distance() < 8) {
        // everything fits (a narrow filter): nothing to pan
        gsap.set(el.querySelector('[data-pan-hint]'), { autoAlpha: 0 });
        return;
      }
      const lean = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
      const clampSkew = gsap.utils.clamp(-7, 7);
      let settle: gsap.core.Tween | undefined;

      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            lean(clampSkew(self.getVelocity() / -260));
            settle?.kill();
            settle = gsap.delayedCall(0.12, () => lean(0));
            if (counter.current) {
              const i = Math.min(items.length, Math.round(self.progress * (items.length - 1)) + 1);
              counter.current.textContent = pad(i);
            }
          },
        },
      });
      gsap.fromTo(el.querySelector('[data-progress]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true } });

      // cards swing in from the right edge as the track carries them into view
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { rotateY: -28, rotateZ: 2.5, yPercent: 8, autoAlpha: 0.25, transformPerspective: 900, transformOrigin: '0% 50%' },
          {
            rotateY: 0,
            rotateZ: 0,
            yPercent: 0,
            autoAlpha: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 100%', end: 'left 62%', scrub: true },
          },
        );
      });
      requestAnimationFrame(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
      return () => settle?.kill();
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="relative flex h-[100svh] flex-col overflow-hidden pb-16 pt-24">
      <div className="container mx-auto px-6 md:px-10">{filtersBar}</div>

      <div className="container mx-auto flex min-h-0 flex-1 items-center px-6 md:px-10">
        <div data-track className="flex w-max items-stretch gap-6 will-change-transform">
          {items.map((project) => (
            <article key={project.title} data-card data-lock className="panel group flex w-[clamp(20rem,29vw,26rem)] flex-col">
              <ProjectCard project={project} />
            </article>
          ))}
          <div data-card className="flex w-[clamp(16rem,20vw,20rem)] flex-col justify-center gap-4 border-l border-[var(--line)] pl-8">
            <span className="hud-label">End of reel</span>
            <p className="font-display text-3xl font-bold uppercase leading-tight">
              More on <span className="accent-text">GitHub</span>
            </p>
            <a href="https://github.com/Champion2049" target="_blank" rel="noopener noreferrer" className="btn-hud btn-hud-ghost self-start">
              <Github size={15} /> Champion2049
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex items-center gap-4 px-6 md:px-10">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          <span ref={counter} className="text-primary">01</span> / {pad(items.length)}
        </span>
        <div className="relative h-px flex-1 bg-[var(--line)]">
          <span data-progress className="absolute inset-0 origin-left bg-primary shadow-[0_0_8px_hsl(186_100%_50%/0.8)]" />
        </div>
        <span data-pan-hint className="hud-label">Scroll ↓ to pan</span>
      </div>
    </div>
  );
}

export function ProjectsSection() {
  const [active, setActive] = useState<'All' | Category>('All');
  const gallery = useGalleryMode();
  const lenis = useLenis();
  const section = useRef<HTMLElement>(null);

  const visible = active === 'All' ? projectsData : projectsData.filter((p) => p.category === active);

  const choose = (f: 'All' | Category) => {
    if (f === active) return;
    // In the gallery the pin length changes with the filter: rewind to the first card first.
    const pinned = gallery && section.current?.querySelector('.pin-spacer');
    if (pinned && lenis) {
      const top = (pinned as HTMLElement).getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) lenis.scrollTo(top, { immediate: true, force: true });
    }
    setActive(f);
  };

  const filtersBar = (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const count = f === 'All' ? projectsData.length : projectsData.filter((p) => p.category === f).length;
        return (
          <button
            key={f}
            onClick={() => choose(f)}
            aria-pressed={active === f}
            className={`press border px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] ${
              active === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-[var(--line-strong)] text-muted-foreground hover:border-primary hover:text-foreground'
            }`}
          >
            {f} <span className="opacity-60">[{pad(count)}]</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="projects" ref={section} className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="05"
          title={<>Things I've <span className="accent-text">built</span></>}
          description="From RF anomaly detection to reinforcement-learning agents and full-stack tooling. Filter by domain."
        />
      </div>

      {gallery ? (
        <Gallery items={visible} active={active} filtersBar={filtersBar} />
      ) : (
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">{filtersBar}</div>
          <motion.div layout className="grid gap-5 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((project) => (
                <motion.article
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="panel group flex flex-col"
                >
                  <ProjectCard project={project} />
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </section>
  );
}
