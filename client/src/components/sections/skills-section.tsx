import { motion } from 'framer-motion';
import { Code2, Server, Brain, LineChart, Cpu, Wrench } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSpotlight } from '@/lib/use-spotlight';

const skillsData = [
  { icon: Code2, title: 'Languages', skills: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C'] },
  { icon: Server, title: 'Web & Backend', skills: ['React', 'Node.js', 'Next.js', 'Express', 'REST APIs', 'Docker', 'GCP'] },
  { icon: Brain, title: 'AI & Machine Learning', skills: ['PyTorch', 'TensorFlow / Keras', 'LangChain', 'Transformers / LLMs', 'Reinforcement Learning', 'spaCy / NLP'] },
  { icon: LineChart, title: 'Data & Research', skills: ['Data Structures & Algorithms', 'NumPy / Pandas', 'Optuna', 'GROMACS / MDAnalysis', 'Stable-Baselines3'] },
  { icon: Cpu, title: 'Hardware & Signals', skills: ['Signal Processing (DSP)', 'SDR / ADALM-PLUTO', 'Raspberry Pi', 'Computer Vision', 'IoT / Embedded'] },
  { icon: Wrench, title: 'Tools & Frameworks', skills: ['Git', 'Linux', 'Flask', 'MediaPipe / OpenCV', 'MCP', 'Gemini API'] },
];

const marquee = [
  'Python', 'PyTorch', 'LangChain', 'React', 'TypeScript', 'Docker', 'GCP',
  'OpenCV', 'spaCy', 'Keras', 'Node.js', 'Raspberry Pi', 'SDR', 'Optuna', 'MCP', 'Next.js',
];

export function SkillsSection() {
  const { onMouseMove } = useSpotlight();

  return (
    <section id="skills" className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <SectionHeading
          index="02"
          kicker="Capabilities"
          title={<>The <span className="accent-text">toolkit</span></>}
          description="A working stack spanning research-grade ML, production web systems, and the hardware in between."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillsData.map((skill, index) => (
            <motion.div
              key={skill.title}
              className="card-spotlight panel p-6 group"
              onMouseMove={onMouseMove}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <skill.icon size={22} />
                </div>
                <h3 className="font-space text-xl font-semibold">{skill.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skill.skills.map((item) => (
                  <span key={item} className="tag-chip text-muted-foreground group-hover:border-primary/20">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative mt-20 border-y border-border/60 py-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10">
          {[...marquee, ...marquee].map((t, i) => (
            <span key={i} className="font-mono text-sm text-muted-foreground/70 whitespace-nowrap">
              {t} <span className="text-primary/50 ml-10">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
