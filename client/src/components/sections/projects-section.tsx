import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ElectricBorder from '@/components/ui/ElectricBorder';

const projectsData = [
	{
		title: 'LLM Optimized Gold Nanoparticle Synthesis',
		description:
			'Engineered a system using Gemini API and Keras deep learning to optimize AuNP synthesis for cancer treatment. The system predicts nanoparticle properties and provides intelligent suggestions for process improvement.',
		tags: ['Python', 'Keras', 'Gemini API'],
		period: 'Jan 2025 – Jul 2025',
		github: 'https://github.com/Champion2049/LLM_Optimized_Synth_AuNP',
	},
	{
		title: 'Energy Conservation with Custom LWT',
		description:
			'Implemented a custom Lifting Wavelet Transform from scratch for data preprocessing and energy consumption analysis. Developed a UI for users to apply LWT to their own N-D datasets.',
		tags: ['Python', 'Neural Networks', 'UI'],
		period: 'Jan 2025 – Jul 2025',
		github: 'https://github.com/Champion2049/EnergyCons',
	},
	{
		title: 'Gesture-Based Hill Climb Racing',
		description:
			'Created a Python project using MediaPipe and OpenCV that allows users to play Hill Climb Racing using hand gestures. Open palm controls gas and fist controls brake.',
		tags: ['Python', 'MediaPipe', 'OpenCV'],
		period: 'Aug 2025',
		github: 'https://github.com/Champion2049/Hill_Climb_GestureBased',
	},
	{
		title: 'Lightweight Vehicle Tracking System',
		description:
			'Developed and compared Contour and Hough Transform algorithms for autonomous RC car path following. Used Raspberry Pi for real-time video processing and motor control. Published findings in IEEE conference.',
		tags: ['Python', 'OpenCV', 'Raspberry Pi'],
		period: 'Oct 2024 – Feb 2025',
		github: 'https://github.com/Champion2049/Contour_vs_Hough',
	},
	{
		title: 'Psychoactive Substances ML Classification',
		description:
			'Multi-stage machine learning application with Flask frontend to predict substance use from personality traits and classify substances based on chemical properties.',
		tags: ['Python', 'Flask', 'Machine Learning'],
		period: 'Sep 2024 – Jun 2025',
		github: 'https://github.com/Champion2049/PsychoactiveFusionML',
	},
	{
		title: 'Hack Flappy Bird',
		description:
			'Developed a Flappy Bird game using the Jack language, featuring procedural world generation and power-ups, designed to run on the Nand2Tetris Hack computer.',
		tags: ['Jack', 'Game Development', 'Nand2Tetris'],
		period: 'Jan 2025 – May 2025',
		github: 'https://github.com/Champion2049/HackFlappyBird',
	},
	{
		title: 'Molecular Dynamics: Analysis of a Polymer',
		description:
			'Conducted molecular dynamics simulations of a polymer using GROMACS and performed comprehensive trajectory analysis with MDAnalysis to assess structural stability and flexibility.',
		tags: ['GROMACS', 'MDAnalysis', 'Python'],
		period: 'Nov 2024',
		github: 'https://github.com/Champion2049/MolecularDynamics',
	},
	{
		title: 'Discord Bot',
		description:
			'Developed a multi-functional Discord bot using Node.js and the discord.js library, featuring commands for music playback from YouTube, user management, and message moderation.',
		tags: ['Node.js', 'Discord.js', 'APIs'],
		period: 'Sep 2020 – Nov 2022',
		github: 'https://github.com/Champion2049/Discord_Bot',
	},
];

export function ProjectsSection() {
	return (
		<section id="projects" className="min-h-screen py-20 bg-background">
			<div className="container mx-auto px-8">
				<motion.h2
					className="font-space text-5xl md:text-6xl font-bold text-center mb-16"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
					data-testid="projects-title"
				>
					<span className="text-white">My</span> <span className="text-primary">Projects</span>
				</motion.h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{projectsData.map((project, index) => (
						<ElectricBorder
							key={index}
							color="hsl(130 70% 50%)"
							speed={1}
							chaos={0.5}
							thickness={2}
							style={{ borderRadius: 16 }}
						>
						<motion.div
							
							className="bg-card p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex flex-col h-full"
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.5,
								delay: index * 0.1,
								ease: [0.23, 1, 0.32, 1],
							}}
						>
							<h3 className="text-2xl font-bold mb-2 text-primary">
								{project.title}
							</h3>
							<p className="text-muted-foreground mb-4 flex-grow">
								{project.description}
							</p>
							<div className="flex flex-wrap gap-2 mb-4">
								{project.tags.map((tag, i) => (
									<span
										key={i}
										className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
									>
										{tag}
									</span>
								))}
							</div>
							<div className="flex justify-between items-center mt-auto">
								<span className="text-xs text-muted-foreground">
									{project.period}
								</span>
								<a
									href={project.github}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline flex items-center"
								>
									GitHub <ArrowRight className="ml-1 h-4 w-4" />
								</a>
							</div>
						</motion.div>
						</ElectricBorder>
					))}
				</div>
			</div>
		</section>
	);
}
