import { SectionHeading } from '@/components/ui/section-heading';

const facts = [
  { label: 'Based in', value: 'Bengaluru, India' },
  { label: 'Studying', value: 'AI & Data Science, Amrita' },
  { label: 'Focus', value: 'Deep learning, RF & DSP' },
  { label: 'Last role', value: 'AI Engineering Intern, ApplyBeeAI' },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-28 md:pb-40 md:pt-12">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="01"
          title={<>The person behind the <span className="accent-text">commits</span></>}
        />

        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div data-reveal className="space-y-6 text-lg leading-relaxed text-muted-foreground lg:col-span-7">
            <p>
              I'm a third-year <span className="font-medium text-foreground">Artificial Intelligence &amp; Data Science</span> student at
              Amrita Vishwa Vidyapeetham, Bengaluru, holding a <span className="font-medium text-foreground">9.29 CGPA</span>, with three
              peer-reviewed publications. My work spans deep-learning research, RF &amp; signal processing, and production ML deployment.
              Lately that's meant 3D face reconstruction and agentic spam-call detection.
            </p>
            <p>
              Most recently I was an <span className="font-medium text-foreground">AI Engineering Intern at ApplyBeeAI</span>, building NLP
              and agentic pipelines with LangChain, spaCy and Gemini across 7+ applicant tracking systems, and deploying containerized AI
              modules to GCP. Before that, as a Software Engineering Intern at{' '}
              <span className="font-medium text-foreground">SigNoz</span>, I architected a Model Context Protocol (MCP) server from scratch
              in Node.js &amp; TypeScript, exposing real-time trace and log data to AI clients like Cursor, Windsurf and Claude.
            </p>
            <p>
              Beyond the keyboard, I'm active in IEEE societies, and also am a part of the rover team on campus, and recharge with guitar,
              badminton, and the gym. If any of this resonates with you technically or otherwise, I'd love to have you connect with me.
            </p>
          </div>

          <dl data-reveal className="space-y-6 border-l border-[var(--line-strong)] pl-6 lg:col-span-4 lg:col-start-9 lg:mt-2">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-sm text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 font-display text-lg font-semibold leading-snug text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
