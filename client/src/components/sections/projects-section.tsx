import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Star, Github } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSpotlight } from '@/lib/use-spotlight';

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

export function ProjectsSection() {
  const [active, setActive] = useState<'All' | Category>('All');
  const { onMouseMove } = useSpotlight();

  const visible = active === 'All' ? projectsData : projectsData.filter((p) => p.category === active);

  return (
    <section id="projects" className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="05"
          kicker="Selected Work"
          title={<>Things I've <span className="accent-text">built</span></>}
          description="From RF anomaly detection to reinforcement-learning agents and full-stack tooling. Filter by domain."
        />

        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map((f) => {
            const count = f === 'All' ? projectsData.length : projectsData.filter((p) => p.category === f).length;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`rounded-full px-4 py-2 font-mono text-xs transition-all border ${
                  active === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {f} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <motion.article
                key={project.title}
                layout
                onMouseMove={onMouseMove}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="card-spotlight panel group flex flex-col p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tag-chip border-primary/30 text-primary">{project.category}</span>
                    {project.featured && (
                      <span className="tag-chip border-primary/50 text-primary inline-flex items-center gap-1">
                        <Star size={11} /> Featured
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[0.7rem] text-muted-foreground whitespace-nowrap">{project.period}</span>
                </div>

                <h3 className="font-space text-xl font-bold leading-snug group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((t) => (
                    <span key={t} className="tag-chip text-muted-foreground">{t}</span>
                  ))}
                </div>

                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 font-mono text-sm text-primary hover:gap-3 transition-all"
                >
                  <Github size={16} /> View source
                  <ArrowUpRight size={15} />
                </a>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
