import { motion } from 'framer-motion';
import { Code2, Server, Palette, Gauge, Settings, Rocket } from 'lucide-react';
import { animations } from '@/lib/animations';

const skillsData = [
	{
		icon: Code2,
		title: 'Programming Languages',
		skills: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C'],
	},
	{
		icon: Server,
		title: 'Web Development',
		skills: ['React', 'Node.js', 'Next.js', 'Express', 'REST APIs'],
	},
	{
		icon: Palette,
		title: 'AI & Machine Learning',
		skills: [
			'TensorFlow / Keras',
			'MediaPipe / OpenCV',
			'Transformers / LLMs',
			'Reinforcement Learning',
			'DL / NN',
		],
	},
	{
		icon: Gauge,
		title: 'Data Science',
		skills: [
			'Data Structures & Algorithms',
			'GROMACS',
			'MDAnalysis',
			'Data Analysis',
			'Numpy / Pandas',
		],
	},
	{
		icon: Settings,
		title: 'Hardware & Systems',
		skills: [
			'Raspberry Pi',
			'IoT Integration',
			'Computer Vision',
			'Robotics',
			'Embedded Systems',
		],
	},
	{
		icon: Rocket,
		title: 'Tools & Frameworks',
		skills: ['Flask', 'Discord.js', 'Git', 'Linux', 'Database Management'],
	},
];

export function SkillsSection() {
	return (
		<section
			id="skills"
			className="min-h-screen py-20 bg-background text-foreground relative overflow-hidden"
		>
			

			<div className="container mx-auto px-8 relative z-10">
				<motion.h2
					className="font-space text-5xl md:text-6xl font-bold text-center mb-16"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{
						duration: 0.8,
						ease: [0.23, 1, 0.32, 1],
					}}
					data-testid="skills-title"
				>
					Technical{' '}
					<span className="text-accent">Skills</span>
				</motion.h2>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{skillsData.map((skill, index) => (
						<motion.div
							key={skill.title}
							className="skill-card glass-effect p-8 rounded-3xl transform perspective-1000"
							variants={animations.skillCard3D}
							initial="initial"
							whileInView="animate"
							whileHover="whileHover"
							viewport={{ once: true }}
							transition={{
								duration: 1,
								delay: index * 0.1,
								ease: [0.23, 1, 0.32, 1],
							}}
							data-testid={`skill-card-${index}`}
						>
							<div className="text-accent text-4xl mb-6">
								<skill.icon size={48} />
							</div>
							<h3
								className="font-space text-2xl font-bold mb-4"
								data-testid={`skill-title-${index}`}
							>
								{skill.title}
							</h3>
							<ul className="space-y-2 text-muted-foreground">
								{skill.skills.map((item, skillIndex) => (
									<li
										key={item}
										data-testid={`skill-item-${index}-${skillIndex}`}
									>
										{item}
									</li>
								))}
							</ul>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
