import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSpotlight } from '@/lib/use-spotlight';

const experienceData = [
<<<<<<< HEAD
  {
    company: 'ApplyBeeAI',
    position: 'AI Engineering Intern',
    period: 'Dec 2025 – Mar 2026',
    location: 'Bengaluru, KA',
    current: true,
    stack: ['LangChain', 'spaCy', 'Gemini', 'Docker', 'GCP'],
    description: [
      'Engineered core NLP and agentic capabilities using LangChain, spaCy and Gemini, scaling automated processing pipelines across 7+ applicant tracking systems including Naukri and Workday.',
      'Designed, containerized with Docker, and deployed core AI product modules to GCP, collaborating directly with founders to turn complex requirements into scalable early-stage solutions.',
    ],
  },
  {
    company: 'SigNoz',
    position: 'Intern',
    period: 'May 2025 – Jul 2025',
    location: 'Bengaluru, KA',
    current: false,
    stack: ['Node.js', 'TypeScript', 'MCP', 'Observability'],
    description: [
      'Architected and developed a Model Context Protocol (MCP) server from scratch using Node.js and TypeScript to streamline data access for AI-powered clients.',
      'Integrated official SigNoz APIs to fetch and process real-time trace and log data, enabling comprehensive observability.',
      'Engineered the server for seamless accessibility from GPT-based clients including Cursor, Windsurf and Claude, informed by research into solutions like Honeycomb’s MCP.',
    ],
  },
];

const educationData = {
  degree: 'B.Tech, Artificial Intelligence & Data Science',
  institution: 'Amrita Vishwa Vidyapeetham',
  location: 'Bengaluru, KA',
  period: 'Aug 2024 – May 2028',
  cgpa: '9.33',
  achievements: [
    'IEEE Computational Intelligence Society — GenAI session as main speaker',
    'IEEE SIGHT — promoting technology for social impact',
    'JIDO Automation Club — workshops on & off campus',
    'Rover Team AVV-B — building a new competition rover',
    'Toastmasters International — communication & networking',
  ],
};

export function ExperienceSection() {
  const { onMouseMove } = useSpotlight();

  return (
    <section id="experience" className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="03"
          kicker="Trajectory"
          title={<>Experience &amp; <span className="accent-text">education</span></>}
        />

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <div className="relative pl-8 border-l border-border">
              {experienceData.map((exp, index) => (
                <motion.div
                  key={exp.company}
                  className="relative mb-10 last:mb-0"
                  onMouseMove={onMouseMove}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <span className={`absolute -left-[2.6rem] top-1.5 grid place-items-center h-5 w-5 rounded-full border-2 ${exp.current ? 'border-primary bg-primary/20' : 'border-border bg-background'}`}>
                    <span className={`h-2 w-2 rounded-full ${exp.current ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                  </span>
                  <div className="card-spotlight panel p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-space text-2xl font-bold">{exp.company}</h3>
                        <p className="text-primary font-medium">{exp.position}</p>
                      </div>
                      {exp.current && (
                        <span className="tag-chip border-primary/40 text-primary">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-4 font-mono text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar size={13} /> {exp.period}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={13} /> {exp.location}</span>
                    </div>
                    <ul className="space-y-2.5 text-muted-foreground text-[0.95rem] leading-relaxed">
                      {exp.description.map((d, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {exp.stack.map((s) => (
                        <span key={s} className="tag-chip text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="lg:col-span-2"
            onMouseMove={onMouseMove}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="card-spotlight panel p-6 h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                  <GraduationCap size={22} />
                </div>
                <h3 className="font-space text-xl font-semibold">Education</h3>
              </div>
              <h4 className="font-medium text-lg leading-snug">{educationData.degree}</h4>
              <p className="text-primary mt-1">{educationData.institution}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 font-mono text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar size={13} /> {educationData.period}</span>
                <span className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5">CGPA {educationData.cgpa}</span>
              </div>

              <div className="hairline my-5" />
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">Clubs & Activities</p>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {educationData.achievements.map((a) => (
                  <li key={a} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
=======
	{
		company: 'SigNoz',
		position: 'Intern',
		period: 'May 2025 – Jul 2025',
		location: 'Bengaluru, Karnataka',
		description: [
			'Architected and developed a Model Context Protocol (MCP) server from scratch using Node.js and TypeScript to streamline data access for AI-powered clients.',
			'Integrated official SigNoz APIs to fetch and process real-time trace and log data, enabling comprehensive observability.',
			'Engineered the server to ensure seamless accessibility from various GPT-based clients, including Cursor, Windsurf, and Claude.',
			'Conducted research on existing solutions, such as Honeycomb\'s MCP, to improve the server\'s design and implementation strategy.',
		],
	},
];

const educationData = {
	degree: 'Bachelor\'s of Technology in Artificial Intelligence & Data Science',
	institution: 'Amrita Vishwa Vidyapeetham',
	location: 'Bengaluru, Karnataka',
	period: 'Aug 2024 – May 2028',
	cgpa: '9.33',
	achievements: [
		'IEEE Computational Intelligence Society: Conducted GenAI session as main speaker',
		'IEEE Special Interest Group on Humanitarian Technology: Promoting tech for social impact',
		'JIDO Automation Club: Conducted multiple workshops on and off campus',
		'Rover Team AVV-B: Assisting in creation of new rover for competitions',
		'Toastmasters International: Improving networking and conversational skills',
	],
};

export function ExperienceSection() {
	return (
		<section id="experience" className="min-h-screen py-20 bg-background">
			<div className="container mx-auto px-8">
				<motion.h2
					className="font-space text-5xl md:text-6xl font-bold text-center mb-16 text-white"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
				>
					Experience &{' '}
					<span className="text-primary">Education</span>
				</motion.h2>

				<div className="grid lg:grid-cols-2 gap-12">
					{/* Experience */}
					<div className="space-y-8">
						<motion.h3
							className="font-space text-3xl font-bold mb-8 text-white"
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8 }}
						>
							Professional Experience
						</motion.h3>

						{experienceData.map((exp, index) => (
							<motion.div
								key={exp.company}
								className="glass-effect p-8 rounded-3xl text-white"
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, delay: index * 0.2 }}
							>
								<div className="flex items-start justify-between mb-4">
									<div>
										<h4 className="font-space text-2xl font-bold text-primary">
											{exp.company}
										</h4>
										<p className="text-xl font-semibold text-white">
											{exp.position}
										</p>
									</div>
									<Building2 className="text-primary" size={32} />
								</div>

								<div className="flex items-center gap-4 mb-6 text-sm text-white">
									<div className="flex items-center gap-1">
										<Calendar size={16} />
										<span>{exp.period}</span>
									</div>
									<div className="flex items-center gap-1">
										<MapPin size={16} />
										<span>{exp.location}</span>
									</div>
								</div>

								<ul className="space-y-3">
									{exp.description.map((desc, descIndex) => (
										<li
											key={descIndex}
											className="text-white"
										>
											• {desc}
										</li>
									))}
								</ul>
							</motion.div>
						))}
					</div>

					{/* Education */}
					<div className="space-y-8">
						<motion.h3
							className="font-space text-3xl font-bold mb-8 text-white"
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8 }}
						>
							Education
						</motion.h3>

						<motion.div
							className="glass-effect p-8 rounded-3xl text-white"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<div className="mb-6">
								<h4 className="font-space text-xl font-bold text-primary mb-2">
									{educationData.degree}
								</h4>
								<p className="text-lg font-semibold text-white">
									{educationData.institution}
								</p>
								<div className="flex items-center gap-4 mt-2 text-sm text-white">
									<div className="flex items-center gap-1">
										<Calendar size={16} />
										<span>{educationData.period}</span>
									</div>
									<div className="flex items-center gap-1">
										<MapPin size={16} />
										<span>{educationData.location}</span>
									</div>
								</div>
								<div className="mt-2">
									<span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
										CGPA: {educationData.cgpa}
									</span>
								</div>
							</div>

							<div>
								<h5 className="font-semibold mb-3 text-white">
									Clubs & Activities:
								</h5>
								<ul className="space-y-2">
									{educationData.achievements.map(
										(achievement, achIndex) => (
											<li
												key={achIndex}
												className="text-white text-sm"
											>
												• {achievement}
											</li>
										),
									)}
								</ul>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
