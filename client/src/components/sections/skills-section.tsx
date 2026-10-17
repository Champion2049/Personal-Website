import { useRef } from 'react';
import { Code2, Server, Brain, LineChart, Cpu, Wrench } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';

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

const domains = ['Machine Learning', 'Signals', 'Systems', 'Research', 'Hardware', 'Agents'];

/** A short light segment that runs around the card's border while it's hovered. */
function LightTrace() {
  return (
    <svg aria-hidden className="light-trace pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <rect width="100%" height="100%" pathLength={100} />
    </svg>
  );
}

/**
 * Two-row ticker on a GSAP loop: it idles along, speeds up with scroll
 * velocity and flips direction with the scroll. Paused while off-screen.
 */
function useVelocityTicker(root: React.RefObject<HTMLElement>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>('[data-ticker]', root.current);
      const loops = rows.map((row, i) => {
        const tl = gsap.to(row, { xPercent: -50, ease: 'none', duration: i ? 36 : 26, repeat: -1 });
        tl.totalTime(tl.duration() * 50); // headroom so a reversed loop never hits its start
        return tl;
      });
      const base = [1, -1];
      let dir = 1;
      const settle = gsap.delayedCall(0.25, () => loops.forEach((l, i) => gsap.to(l, { timeScale: base[i] * dir, duration: 0.9, ease: 'power2.out', overwrite: true }))).pause();
      ScrollTrigger.create({
        trigger: root.current!.querySelector('[data-ticker-wrap]'),
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => loops.forEach((l) => (self.isActive ? l.resume() : l.pause())),
        onUpdate: (self) => {
          dir = self.direction;
          const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(self.getVelocity()) / 350);
          loops.forEach((l, i) => gsap.to(l, { timeScale: base[i] * dir * boost, duration: 0.25, overwrite: true }));
          settle.restart(true);
        },
      });
    },
    { scope: root },
  );
}

export function SkillsSection() {
  const root = useRef<HTMLElement>(null);
  useVelocityTicker(root);

  // Desktop: the three columns drift at different speeds, so the grid slips out of register as you scroll.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        const drift = [36, -28, 64];
        gsap.utils.toArray<HTMLElement>('[data-col]', root.current).forEach((el) => {
          const d = drift[Number(el.dataset.col)];
          gsap.fromTo(el, { y: d }, { y: -d, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="skills" ref={root} className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <SectionHeading
          index="02"
          title={<>The <span className="accent-text">toolkit</span></>}
          description="A working stack spanning research-grade ML, production web systems, and the hardware in between."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillsData.map((skill, index) => (
            <div data-reveal data-col={index % 3} key={skill.title} className="panel group relative flex flex-col">
              <LightTrace />
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

      {/* Data ticker (the protocol strip along the IP.AXIS frame), plus a big outline row running the other way */}
      <div data-ticker-wrap aria-hidden className="relative mt-24 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="overflow-hidden border-y border-[var(--line)] py-3">
          <div data-ticker className="flex w-max">
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 gap-8 pr-8">
                {marquee.map((t) => (
                  <span key={t} className="whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {t} <span className="ml-8 text-primary/60">//</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden py-4">
          <div data-ticker className="flex w-max">
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 items-center gap-10 pr-10">
                {domains.map((t, i) => (
                  <span key={t} className={`whitespace-nowrap font-display text-5xl font-extrabold uppercase leading-none md:text-7xl ${i % 2 ? 'text-foreground/90' : 'text-transparent [-webkit-text-stroke:1.5px_hsl(186_100%_50%/0.7)]'}`}>
                    {t}
                    <span className="ml-10 inline-block h-3 w-3 rotate-45 bg-primary/70 align-middle" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
