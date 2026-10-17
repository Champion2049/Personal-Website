import { FileText, BookOpen, Trophy, Medal } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Barcode } from '@/components/hud/barcode';

const publications = [
  {
    type: 'IEEE Conference',
    icon: FileText,
    title: 'Contour-based Tracking vs Hough Transform-based Tracking: An RC Car Experiment',
    venue: '3rd IEEE World Conference on Communication & Computing (WCONF-2025), Kalinga University',
    year: '2025',
    status: 'Published',
  },
  {
    type: 'IEEE Conference',
    icon: FileText,
    title: 'The Effects and Classification of Psychoactive Substances: A Machine Learning Approach',
    venue: 'IEEE Int. Conf. on Computational Systems and Information Technology for Sustainable Solutions (CSITSS 2025)',
    year: '2025',
    status: 'Published',
  },
  {
    type: 'Springer Journal',
    icon: BookOpen,
    title: 'Thermoelectric Energy Optimization with Deep Reinforcement Learning',
    venue: 'Springer Nature Journal',
    year: '2025',
    status: 'Published',
  },
];

const honors = [
  {
    icon: Trophy,
    title: 'ICPC Regionalist',
    year: '2025',
    detail: 'Qualified for the International Collegiate Programming Contest Regionals — top-tier problem-solving and algorithmic optimization under pressure.',
  },
  {
    icon: Medal,
    title: 'National Finalist — Top 6',
    year: 'Novo Nordisk Hackathon · 2025',
    detail: 'Placed in the top 6 nationally in a highly competitive healthcare-innovation hackathon.',
  },
];

export function PublicationsSection() {

  return (
    <section id="publications" className="relative py-28 md:py-36 overflow-hidden">
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <SectionHeading
          index="04"
          title={<>Publications &amp; <span className="accent-text">honors</span></>}
          description="Peer-reviewed work across computer vision, machine learning and reinforcement learning, along with a few competitive milestones."
        />

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Publications */}
          <div className="lg:col-span-2 space-y-4">
            <p className="hud-label">Selected publications</p>
            {publications.map((pub, i) => (
              <div data-reveal key={pub.title} className="panel grid grid-cols-[auto_1fr] gap-x-5">
                <div className="flex w-16 flex-col items-center justify-between gap-3 border-r border-[var(--line)] py-5">
                  <pub.icon size={18} className="text-primary" />
                  <span className="font-mono text-[0.65rem] text-muted-foreground [writing-mode:vertical-rl]">DOC/{pub.year.slice(2)}-{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="min-w-0 py-5 pr-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="tag-chip text-foreground/75">{pub.type}</span>
                    <span className="tag-chip border-primary/50 text-primary">{pub.status}</span>
                    <span className="font-mono text-xs text-muted-foreground">{pub.year}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold leading-snug">{pub.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pub.venue}</p>
                  <Barcode value={pub.title} className="mt-4 h-5 w-40 text-foreground/40" />
                </div>
              </div>
            ))}
          </div>

          {/* Honors */}
          <div className="space-y-4">
            <p className="hud-label">Achievements</p>
            {honors.map((h, i) => (
              <div data-reveal
                key={h.title}
                className="panel p-6"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center border border-primary/50 text-primary">
                    <h.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold uppercase leading-tight tracking-wide">{h.title}</h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{h.year}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
