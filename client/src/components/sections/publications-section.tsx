import { motion } from 'framer-motion';
import { FileText, BookOpen, Trophy, Medal } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSpotlight } from '@/lib/use-spotlight';

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
  const { onMouseMove } = useSpotlight();

  return (
    <section id="publications" className="relative py-28 md:py-36 overflow-hidden">
      <div className="glow-blob animate-blob" style={{ width: 400, height: 400, top: '10%', right: '-8%', background: 'radial-gradient(circle, hsl(192 100% 55% / 0.18), transparent 70%)' }} />
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <SectionHeading
          index="04"
          kicker="Research & Recognition"
          title={<>Publications &amp; <span className="accent-text">honors</span></>}
          description="Peer-reviewed work across computer vision, machine learning and reinforcement learning, along with a few competitive milestones."
        />

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Publications */}
          <div className="lg:col-span-2 space-y-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Selected publications</p>
            {publications.map((pub, i) => (
              <motion.div
                key={pub.title}
                className="card-spotlight panel p-6 flex gap-4"
                onMouseMove={onMouseMove}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <div className="shrink-0 grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                  <pub.icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="tag-chip text-muted-foreground">{pub.type}</span>
                    <span className={`tag-chip ${pub.status === 'Published' ? 'border-green-500/40 text-green-400' : 'border-primary/40 text-primary'}`}>
                      {pub.status}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{pub.year}</span>
                  </div>
                  <h3 className="font-space font-semibold text-lg leading-snug">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{pub.venue}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Honors */}
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Achievements</p>
            {honors.map((h, i) => (
              <motion.div
                key={h.title}
                className="card-spotlight panel p-6"
                onMouseMove={onMouseMove}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                    <h.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-space font-semibold leading-tight">{h.title}</h3>
                    <p className="font-mono text-xs text-muted-foreground">{h.year}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
