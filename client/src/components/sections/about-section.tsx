import { Music2, Dumbbell, Cpu } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Barcode } from '@/components/hud/barcode';

const facts = [
  { label: 'Name', value: 'Chirayu N. Chaudhari' },
  { label: 'Based in', value: 'Bengaluru, India' },
  { label: 'Studying', value: 'AI & Data Science' },
  { label: 'Focus', value: 'ML · Agentic AI · DSP' },
  { label: 'Currently', value: 'AI Eng @ ApplyBeeAI' },
  { label: 'Coords', value: '12.9716°N 77.5946°E' },
];

const interests = [
  { icon: Music2, label: 'Guitar — Trinity Grade 5' },
  { icon: Dumbbell, label: 'Gym & Badminton' },
  { icon: Cpu, label: 'IEEE societies & Rover team' },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-28 md:py-40">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="01"
          kicker="About"
          title={<>The person behind the <span className="accent-text">commits</span></>}
        />

        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div data-reveal className="space-y-6 text-lg leading-relaxed text-muted-foreground lg:col-span-7">
            <p>
              I'm a third-year <span className="font-medium text-foreground">Artificial Intelligence &amp; Data Science</span> student at
              Amrita Vishwa Vidyapeetham, Bengaluru, holding a <span className="font-medium text-foreground">9.33 CGPA</span>. I work
              across the full stack of modern AI, ranging from raw signal processing and custom neural nets to agentic systems and the
              web apps that wrap them.
            </p>
            <p>
              Most recently I've been an <span className="font-medium text-foreground">AI Engineering Intern at ApplyBeeAI</span>, building
              core NLP and agentic capabilities with LangChain, spaCy and Gemini, used for scaling automated pipelines across 7+ applicant
              tracking systems and shipping containerized modules to GCP. Before that, at{' '}
              <span className="font-medium text-foreground">SigNoz</span> I architected a Model Context Protocol (MCP) server from scratch
              in Node &amp; TypeScript, accessible from clients like Cursor, Windsurf and Claude.
            </p>
            <p>
              Beyond the keyboard, I'm active in IEEE societies, and also am a part of the rover team on campus, and recharge with guitar,
              badminton, and the gym. If any of this resonates with you technically or otherwise, I'd love to have you connect with me.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {interests.map(({ icon: Icon, label }) => (
                <span key={label} className="tag-chip inline-flex items-center gap-2 py-1.5 text-foreground/80">
                  <Icon size={12} className="text-primary" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Ident card */}
          <aside data-reveal className="panel lg:col-span-5" aria-label="Quick facts">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
              <span className="hud-label text-foreground/80">Ident <span className="text-muted-foreground">//</span> Card CC-26</span>
              <span className="signal-tag">Active</span>
            </div>
            <dl className="divide-y divide-[var(--line)] px-5">
              {facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-3">
                  <dt className="hud-label">{f.label}</dt>
                  <dd className="text-right font-mono text-sm text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center gap-4 border-t border-[var(--line)] px-5 py-4">
              <Barcode value="CHIRAYU.DEV/IDENT" className="h-10 flex-1 text-foreground/85" />
              <div className="text-right">
                <div className="hud-label">Issued</div>
                <div className="font-mono text-xs text-foreground">GRID/BLR</div>
              </div>
            </div>
            <div aria-hidden className="hatch h-3 border-t border-[var(--line)]" />
          </aside>
        </div>
      </div>
    </section>
  );
}
