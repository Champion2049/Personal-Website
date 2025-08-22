import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const projectsData = [
  {
    title: 'SigNoz Model Context Protocol Server',
    description: 'Architected and developed an MCP server from scratch using Node.js and TypeScript for SigNoz internship. Integrated official APIs to fetch real-time trace and log data, enabling comprehensive observability for GPT-based clients.',
    tags: ['Node.js', 'TypeScript', 'APIs'],
    period: 'May 2025 – Jul 2025'
  },
  {
    title: 'LLM Optimized Gold Nanoparticle Synthesis',
    description: 'Engineered a system using Gemini API and Keras deep learning to optimize AuNP synthesis for cancer treatment. The system predicts nanoparticle properties and provides intelligent suggestions for process improvement.',
    tags: ['Python', 'Keras', 'Gemini API'],
    period: 'Jan 2025 – Jul 2025'
  },
  {
    title: 'Energy Conservation with Custom LWT',
    description: 'Implemented a custom Lifting Wavelet Transform from scratch for data preprocessing and energy consumption analysis. Developed a UI for users to apply LWT to their own N-D datasets.',
    tags: ['Python', 'Neural Networks', 'UI'],
    period: 'Jan 2025 – Jul 2025'
  },
  {
    title: 'Gesture-Based Hill Climb Racing',
    description: 'Created a Python project using MediaPipe and OpenCV that allows users to play Hill Climb Racing using hand gestures. Open palm controls gas and fist controls brake.',
    tags: ['Python', 'MediaPipe', 'OpenCV'],
    period: 'Aug 2025'
  },
  {
    title: 'Lightweight Vehicle Tracking System',
    description: 'Developed and compared Contour and Hough Transform algorithms for autonomous RC car path following. Used Raspberry Pi for real-time video processing and motor control. Published findings in IEEE conference.',
    tags: ['Python', 'OpenCV', 'Raspberry Pi'],
    period: 'Oct 2024 – Feb 2025'
  },
  {
    title: 'Psychoactive Substances ML Classification',
    description: 'Multi-stage machine learning application with Flask frontend to predict substance use from personality traits and classify substances based on chemical properties.',
    tags: ['Python', 'Flask', 'Machine Learning'],
    period: 'Sep 2024 – Jun 2025'
  }
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
          My <span className="text-primary">Projects</span>
        </motion.h2>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {projectsData.map((project, index) => (
            <motion.div 
              key={project.title}
              className="project-card group cursor-pointer"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 1, 
                delay: index * 0.2, 
                ease: [0.23, 1, 0.32, 1] 
              }}
              data-testid={`project-card-${index}`}
            >
              <div className="relative overflow-hidden rounded-3xl mb-6">
                <div className="w-full h-64 bg-gradient-to-br from-orange-600 via-red-600 to-amber-600 flex items-center justify-center transition-transform duration-700 group-hover:scale-110"
                     data-testid={`project-image-${index}`}>
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🚀</div>
                    <p className="font-mono text-sm opacity-80">{project.period}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  {project.tags.map((tag, tagIndex) => (
                    <span 
                      key={tag}
                      className="glass-effect px-3 py-1 rounded-full text-sm text-white font-mono mr-2"
                      data-testid={`project-tag-${index}-${tagIndex}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h3 
                className="font-space text-2xl font-bold mb-3"
                data-testid={`project-title-${index}`}
              >
                {project.title}
              </h3>
              <p 
                className="text-muted-foreground mb-4"
                data-testid={`project-description-${index}`}
              >
                {project.description}
              </p>
              <div 
                className="flex items-center text-primary font-semibold"
                data-testid={`project-link-${index}`}
              >
                <span>View Project</span>
                <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-2" size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
