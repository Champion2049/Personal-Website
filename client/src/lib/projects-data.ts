/** Every project on the site, newest first. Shared by the projects section and /now. */
export type Category = 'AI / ML' | 'Signals & Hardware' | 'Web & Systems' | 'Research';

export interface Project {
  title: string;
  description: string;
  tags: string[];
  period: string;
  github: string;
  category: Category;
  featured?: boolean;
  /** Featured projects get a full-screen case file (projects section). */
  caseFile?: CaseFile;
}

export type CaseVisualKind = 'face-mesh' | 'call-signal' | 'constellation' | 'learning-curves';

export interface CaseFile {
  /** A couple of words for the case-file selector. */
  short: string;
  /** One line, the whole project. */
  summary: string;
  problem: string;
  approach: string;
  result: string;
  visual: CaseVisualKind;
}

export const projectsData: Project[] = [
  {
    title: 'Expression-Robust 3D Face Reconstruction (DECA)',
    description: 'Extended the SIGGRAPH 2021 DECA model with a residual correction head over its frozen encoder, fine-tuned on FaceScape to target hard-case expressions. Built the CUDA training pipeline and an evaluation harness with per-sample failure diagnostics; the fine-tuned model beat the pretrained baseline.',
    tags: ['PyTorch', 'CUDA', '3D Vision'],
    period: 'Apr 2026 – May 2026',
    github: 'https://github.com/Champion2049/DECA',
    category: 'AI / ML',
    featured: true,
    caseFile: {
      short: 'DECA',
      summary: 'Making a 3D face model hold up when faces get expressive.',
      problem: 'Pretrained DECA struggles on hard-case expressions.',
      approach: 'A residual correction head over its frozen encoder, fine-tuned on FaceScape, with a CUDA training pipeline and an evaluation harness that diagnoses failures per sample.',
      result: 'The fine-tuned model beat the pretrained baseline.',
      visual: 'face-mesh',
    },
  },
  {
    title: 'Agentic Spam Call & Misinformation Detection',
    description: 'Fuses Whisper ASR transcription, a Log-Mel spectrogram CNN and an NLP scam-scoring model through weighted late fusion, plus an LLM explainability agent that justifies every flagged call, making classifier scores auditable.',
    tags: ['Whisper', 'CNN', 'LLM Agents'],
    period: 'Jan 2026 – Mar 2026',
    github: 'https://github.com/Champion2049/Agentic-Spam-Call-Detection',
    category: 'AI / ML',
    featured: true,
    caseFile: {
      short: 'Spam-call agents',
      summary: 'Catching scam calls, and explaining every flag.',
      problem: 'Classifier scores on their own are hard to trust or audit.',
      approach: 'Whisper transcription, a Log-Mel spectrogram CNN and an NLP scam-scoring model, combined by weighted late fusion.',
      result: 'An LLM agent justifies every flagged call, so the scores are auditable.',
      visual: 'call-signal',
    },
  },
  {
    title: 'Suspicious Signal Detection — ML & SDR',
    description: 'Captured live RF I/Q in ISM bands with an ADALM-PLUTO SDR and wrote a synthetic generator injecting parameterized QPSK bursts. Benchmarked SVM-RBF and Random Forest metadata classifiers against a custom PyTorch 1D CNN on raw I/Q, which caught temporal and spectral anomalies the others missed.',
    tags: ['PyTorch', 'SDR', 'DSP'],
    period: 'Nov 2025 – Dec 2025',
    github: 'https://github.com/Champion2049/SuspiciousSignal-ML-SDR',
    category: 'Signals & Hardware',
    featured: true,
    caseFile: {
      short: 'Signal anomalies',
      summary: 'Spotting anomalies in live radio spectrum.',
      problem: 'Anomalous bursts hide among normal traffic in the ISM bands.',
      approach: 'Live I/Q capture on an ADALM-PLUTO SDR, a generator for parameterised QPSK bursts, and SVM-RBF and Random Forest baselines against a custom PyTorch 1D CNN on raw I/Q.',
      result: 'The CNN caught temporal and spectral anomalies the others missed.',
      visual: 'constellation',
    },
  },
  {
    title: 'Thermoelectric Energy Optimization with Deep RL',
    description: 'A Gymnasium-compatible thermoelectric-generator environment with Optuna-tuned PPO, A2C, DDPG, SAC and DQN agents in Stable-Baselines3 — producing benchmark comparisons and reusable training utilities. Published in a Springer Nature journal.',
    tags: ['RL', 'Stable-Baselines3', 'Optuna'],
    period: 'Aug 2025 – Sep 2025',
    github: 'https://github.com/ShreyaKunda/Thermoelectric-Energy-Optimization-with-Deep-Reinforcement-Learning',
    category: 'AI / ML',
    featured: true,
    caseFile: {
      short: 'Thermoelectric RL',
      summary: 'Teaching agents to run a thermoelectric generator.',
      problem: "Optimising a thermoelectric generator's energy output.",
      approach: 'A Gymnasium environment for the generator, with Optuna-tuned PPO, A2C, DDPG, SAC and DQN agents in Stable-Baselines3.',
      result: 'Benchmarked head to head, and published in a Springer Nature journal.',
      visual: 'learning-curves',
    },
  },
  {
    title: 'LLM-Optimized Gold Nanoparticle Synthesis',
    description: 'A system pairing the Gemini API with a Keras model to optimize AuNP synthesis for cancer treatment — predicting nanoparticle properties from parameters and using the LLM to suggest process improvements.',
    tags: ['Keras', 'Gemini API', 'Python'],
    period: 'Jan 2025 – Jul 2025',
    github: 'https://github.com/Champion2049/LLM_Optimized_Synth_AuNP',
    category: 'AI / ML',
  },
  {
    title: 'Facial Emotion Recognition on KDEF',
    description: 'A reusable pipeline contrasting HOG+LinearSVC baselines with fine-tuned CNN backbones on the KDEF dataset, with packaged utilities for loaders, feature builders and training controls, plus automated metrics, reports and exports.',
    tags: ['CNN', 'OpenCV', 'scikit-learn'],
    period: 'Oct 2025 – Nov 2025',
    github: 'https://github.com/Champion2049/AIML_ImageClass',
    category: 'AI / ML',
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
    description: 'A multi-stage ML application with a Flask frontend predicting substance use from personality traits and classifying substances by chemical properties. Published at IEEE CSITSS 2025.',
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
