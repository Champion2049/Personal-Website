import { SectionHeading } from '@/components/ui/section-heading';

const publications = [
  {
    type: 'Journal',
    title: 'Thermoelectric Energy Optimization with Deep Reinforcement Learning',
    venue: 'Springer Nature Journal',
    year: '2025',
    status: 'Published',
  },
  {
    type: 'Conference',
    title: 'Contour-based Tracking vs Hough Transform-based Tracking: An RC Car Experiment',
    venue: '3rd IEEE World Conference on Communication & Computing (WCONF-2025), Kalinga University',
    year: '2025',
    status: 'Published',
  },
  {
    type: 'Conference',
    title: 'The Effects and Classification of Psychoactive Substances: A Machine Learning Approach',
    venue: 'IEEE Int. Conf. on Computational Systems and Information Technology for Sustainable Solutions (CSITSS 2025)',
    year: '2025',
    status: 'Published',
  },
];

const honors = [
  {
    title: 'ICPC Regionalist',
    year: '2025',
    detail: 'Qualified for the International Collegiate Programming Contest Regionals — top-tier problem-solving and algorithmic optimization under pressure.',
  },
  {
    title: 'National Finalist — Top 6',
    year: 'Novo Nordisk Hackathon · 2025',
    detail: 'Placed in the top 6 nationally in a highly competitive healthcare-innovation hackathon.',
  },
];

export function PublicationsSection() {
  return (
    <section id="publications" className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading index="04" title={<>Publications &amp; <span className="accent-text">honors</span></>} />

        <div className="grid gap-14 lg:grid-cols-3 lg:gap-12">
          <ol className="lg:col-span-2">
            {publications.map((pub) => (
              <li key={pub.title} data-reveal data-lock className="group border-t border-[var(--line)] py-7">
                <h3 className="font-display text-xl font-semibold leading-snug transition-colors group-hover:text-primary md:text-2xl">{pub.title}</h3>
                <p className="mt-2 text-muted-foreground">{pub.venue}</p>
                <p className="mt-2 text-sm text-foreground/70">
                  {pub.type} · {pub.year} · <span className="text-primary">{pub.status}</span>
                </p>
              </li>
            ))}
          </ol>

          <ul className="space-y-10 lg:pt-7">
            {honors.map((h) => (
              <li key={h.title} data-reveal>
                <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide">{h.title}</h3>
                <p className="mt-1 text-sm text-primary">{h.year}</p>
                <p className="mt-3 leading-relaxed text-muted-foreground">{h.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
