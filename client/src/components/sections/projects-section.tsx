import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const projectsData = [
  {
    title: 'Architectural Showcase Platform',
    description: 'A stunning portfolio platform for architectural firms featuring smooth scroll animations, 3D model integration, and responsive design that adapts to any device.',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500',
    alt: 'Minimalist architecture photography',
    tags: ['React', 'GSAP']
  },
  {
    title: 'Productivity Dashboard',
    description: 'An interactive dashboard for remote teams featuring real-time collaboration tools, data visualization, and intelligent workflow automation.',
    image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500',
    alt: 'Modern workspace with clean aesthetics',
    tags: ['Vue.js', 'Three.js']
  },
  {
    title: 'Generative Art Platform',
    description: 'A creative platform for artists to showcase generative art pieces with interactive controls, real-time rendering, and NFT marketplace integration.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500',
    alt: 'Abstract geometric compositions',
    tags: ['WebGL', 'Canvas']
  },
  {
    title: 'Creative Agency Website',
    description: 'A bold, interactive website for a creative agency featuring parallax scrolling, custom animations, and a content management system for easy updates.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500',
    alt: 'Professional creative studio environment',
    tags: ['Next.js', 'Framer']
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
          Featured <span className="text-primary">Projects</span>
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
                    <p className="font-mono text-sm opacity-80">{project.title}</p>
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
