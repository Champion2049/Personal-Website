import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { SectionHeading } from '@/components/ui/section-heading';

const experienceData = [
  {
    company: 'ApplyBeeAI',
    position: 'AI Engineering Intern',
    period: 'Dec 2025 – Mar 2026',
    location: 'Bengaluru, KA',
    current: false,
    stack: ['LangChain', 'spaCy', 'Gemini', 'Docker', 'GCP'],
    description: [
      'Built NLP and agentic pipelines with LangChain, spaCy and Gemini, scaling automated processing across 7+ applicant tracking systems including Naukri and Workday.',
      'Containerized core AI modules with Docker and deployed them to GCP, working with the founders on early-stage architecture decisions.',
    ],
  },
  {
    company: 'SigNoz',
    position: 'Software Engineering Intern',
    period: 'May 2025 – Jul 2025',
    location: 'Bengaluru, KA',
    current: false,
    stack: ['Node.js', 'TypeScript', 'MCP', 'Observability'],
    description: [
      'Architected a Model Context Protocol (MCP) server from scratch in Node.js and TypeScript, exposing real-time SigNoz trace and log data to AI clients.',
      'Shipped compatibility across Cursor, Windsurf and Claude, benchmarking the design against Honeycomb’s MCP.',
    ],
  },
];

const educationData = {
  degree: 'B.Tech, Artificial Intelligence & Data Science',
  institution: 'Amrita Vishwa Vidyapeetham',
  location: 'Bengaluru, KA',
  period: 'Aug 2024 – May 2028',
  cgpa: '9.29',
  achievements: [
    'IEEE Computational Intelligence Society (GenAI session speaker)',
    'IEEE SIGHT',
    'JIDO Automation Club',
    'Rover Team AVV-B',
    'Toastmasters International',
  ],
};

export function ExperienceSection() {
  const rail = useRef<HTMLDivElement>(null);

  // The timeline rail is a light-cycle trail: it draws down as you scroll, head first.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = rail.current!;
      const st = { trigger: el, start: 'top 70%', end: 'bottom 55%', scrub: 0.5, invalidateOnRefresh: true };
      gsap.fromTo(el.querySelector('[data-trail]'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: st });
      gsap.fromTo(el.querySelector('[data-head]'), { y: 0 }, { y: () => el.offsetHeight, ease: 'none', scrollTrigger: st });
    },
    { scope: rail },
  );

  return (
    <section id="experience" className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="03"
          title={<>Experience &amp; <span className="accent-text">education</span></>}
        />

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <div ref={rail} className="relative pl-8">
              <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-[var(--line)]" />
              <span aria-hidden data-trail className="absolute inset-y-0 left-0 w-[2px] -translate-x-[0.5px] origin-top bg-primary shadow-[0_0_10px_hsl(186_100%_50%/0.9)]" />
              <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-full">
                <span data-head className="absolute -left-[5px] -top-1.5 block h-3 w-3 bg-foreground shadow-[0_0_14px_4px_hsl(186_100%_50%/0.8)]" />
              </span>
              {experienceData.map((exp) => (
                <div data-reveal
                  key={exp.company}
                  className="relative mb-10 last:mb-0"
                >
                  <span aria-hidden className={`absolute -left-[2.35rem] top-2 grid h-4 w-4 place-items-center border bg-background ${exp.current ? 'border-primary' : 'border-[var(--line-strong)]'}`}>
                    <span className={`h-1.5 w-1.5 ${exp.current ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  </span>
                  <div className="panel p-6">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-2xl font-bold uppercase tracking-wide">{exp.company}</h3>
                        <p className="mt-0.5 font-medium text-primary">{exp.position}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{exp.period} · {exp.location}</p>
                      </div>
                      {exp.current && <span className="signal-tag">Current</span>}
                    </div>
                    <ul className="space-y-2.5 text-muted-foreground text-[0.95rem] leading-relaxed">
                      {exp.description.map((d, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="mt-2.5 h-1 w-1 shrink-0 bg-primary" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal
            className="lg:col-span-2"
          >
            <div className="panel p-6 h-full">
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide">Education</h3>
              <p className="mt-4 text-lg font-medium leading-snug">{educationData.degree}</p>
              <p className="mt-1 text-primary">{educationData.institution}</p>
              <p className="mt-1 text-sm text-muted-foreground">{educationData.period} · CGPA {educationData.cgpa}</p>

              <div className="hairline my-6" />
              <p className="mb-3 text-sm text-muted-foreground">Clubs &amp; activities</p>
              <ul className="space-y-2 text-foreground/85">
                {educationData.achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
