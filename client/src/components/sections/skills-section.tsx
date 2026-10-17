import { Code2, Server, Brain, LineChart, Cpu, Wrench } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

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
            <div data-reveal key={skill.title} className="panel group flex flex-col">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-2.5">
                <span className="hud-label">Module {String(index + 1).padStart(2, '0')}</span>
                <span className="font-mono text-[0.65rem] text-muted-foreground">{skill.skills.length} units</span>
              </div>
              <div className="flex-1 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center border border-primary/50 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <skill.icon size={18} />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide">{skill.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.skills.map((item) => (
                    <span key={item} className="tag-chip text-foreground/75">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data ticker, like the protocol strip along the IP.AXIS frame */}
      <div aria-hidden className="relative mt-20 overflow-hidden border-y border-[var(--line)] py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-8">
          {[...marquee, ...marquee].map((t, i) => (
            <span key={i} className="whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
              {t} <span className="ml-8 text-primary/60">//</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
