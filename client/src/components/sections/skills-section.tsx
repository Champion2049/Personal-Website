import { SectionHeading } from '@/components/ui/section-heading';

// Grouped exactly as on the résumé.
const skills = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java'] },
  { group: 'ML & AI', items: ['PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'LangChain', 'spaCy', 'Stable-Baselines3', 'Optuna', 'OpenCV'] },
  { group: 'Domains', items: ['Deep learning', 'Reinforcement learning', 'NLP', 'Computer vision', 'Signal processing', 'DSA'] },
  { group: 'Systems & tools', items: ['Docker', 'GCP', 'Git', 'Linux', 'Node.js', 'React', 'Next.js', 'Flask', 'IoT & embedded', 'SDR'] },
];

/** Four columns, one per résumé group, each a plain list. */
export function SkillsSection() {
  return (
    <section id="skills" className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading index="02" title={<>The <span className="accent-text">toolkit</span></>} />

        <dl className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s, i) => (
            <div key={s.group} data-reveal className="group relative border-t border-[var(--line)] pt-6">
              <span aria-hidden className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100" />
              <dt className="flex items-baseline gap-3 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
                {s.group}
              </dt>
              <dd className="mt-6">
                <ul className="space-y-2.5">
                  {s.items.map((item) => (
                    <li key={item} className="text-xl leading-snug text-foreground md:text-2xl">
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
