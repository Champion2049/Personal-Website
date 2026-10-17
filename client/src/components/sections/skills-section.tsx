import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/section-heading';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';

// Grouped exactly as on the résumé.
const skills = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java'] },
  { group: 'ML & AI', items: ['PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'LangChain', 'spaCy', 'Stable-Baselines3', 'Optuna', 'OpenCV'] },
  { group: 'Domains', items: ['Deep learning', 'Reinforcement learning', 'NLP', 'Computer vision', 'Signal processing', 'DSA'] },
  { group: 'Systems & tools', items: ['Docker', 'GCP', 'Git', 'Linux', 'Node.js', 'React', 'Next.js', 'Flask', 'IoT & embedded', 'SDR'] },
];

const domains = ['Deep Learning', 'Signal Processing', 'Computer Vision', 'NLP', 'Reinforcement Learning'];

/** One big outline row that idles along, speeds up with scroll velocity and flips with scroll direction. */
function useVelocityTicker(root: React.RefObject<HTMLElement>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const row = root.current!.querySelector<HTMLElement>('[data-ticker]')!;
      const loop = gsap.to(row, { xPercent: -50, ease: 'none', duration: 34, repeat: -1 });
      loop.totalTime(loop.duration() * 50); // headroom so a reversed loop never hits its start
      let dir = 1;
      const settle = gsap.delayedCall(0.25, () => gsap.to(loop, { timeScale: dir, duration: 0.9, ease: 'power2.out', overwrite: true })).pause();
      ScrollTrigger.create({
        trigger: row,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()),
        onUpdate: (self) => {
          dir = self.direction;
          const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(self.getVelocity()) / 350);
          gsap.to(loop, { timeScale: dir * boost, duration: 0.25, overwrite: true });
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

  return (
    <section id="skills" ref={root} className="relative overflow-hidden py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading index="02" title={<>The <span className="accent-text">toolkit</span></>} />

        <dl>
          {skills.map((s) => (
            <div
              key={s.group}
              data-reveal
              className="group relative grid gap-3 border-t border-[var(--line)] py-7 md:grid-cols-[14rem_1fr] md:gap-10 md:py-9"
            >
              <span aria-hidden className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100" />
              <dt className="text-sm text-muted-foreground transition-colors group-hover:text-primary md:pt-1.5">{s.group}</dt>
              <dd className="text-xl leading-relaxed text-foreground md:text-[1.7rem] md:leading-snug">
                {s.items.map((item, i) => (
                  <span key={item}>
                    {item}
                    {i < s.items.length - 1 && <span aria-hidden className="mx-2.5 text-muted-foreground/40">/</span>}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div aria-hidden className="relative mt-24 overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
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
    </section>
  );
}
