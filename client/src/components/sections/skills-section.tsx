import { motion } from 'framer-motion';
import { Code2, Server, Palette, Gauge, Settings, Rocket } from 'lucide-react';
import { animations } from '@/lib/animations';

const skillsData = [
  {
    icon: Code2,
    title: 'Frontend Mastery',
    skills: ['React / Next.js', 'Vue / Nuxt.js', 'TypeScript', 'Tailwind CSS', 'GSAP / Framer Motion']
  },
  {
    icon: Server,
    title: 'Backend Systems',
    skills: ['Node.js / Express', 'Python / Django', 'PostgreSQL / MongoDB', 'GraphQL / REST APIs', 'AWS / Docker']
  },
  {
    icon: Palette,
    title: 'Creative Tools',
    skills: ['Figma / Adobe XD', 'Three.js / WebGL', 'Blender / Cinema 4D', 'After Effects', 'Photoshop / Illustrator']
  },
  {
    icon: Gauge,
    title: 'Performance',
    skills: ['Web Vitals Optimization', 'Bundle Analysis', 'Lighthouse Scoring', 'CDN Configuration', 'Progressive Enhancement']
  },
  {
    icon: Settings,
    title: 'Development',
    skills: ['Git / GitHub Actions', 'Webpack / Vite', 'Jest / Cypress', 'ESLint / Prettier', 'CI/CD Pipelines']
  },
  {
    icon: Rocket,
    title: 'Emerging Tech',
    skills: ['AI/ML Integration', 'Web3 / Blockchain', 'WebAssembly', 'PWAs / Service Workers', 'Edge Computing']
  }
];

export function SkillsSection() {
  return (
    <section id="skills" className="min-h-screen py-20 bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 neural-grid opacity-30" />
      <div className="absolute inset-0 holographic-bg opacity-20" />
      
      <div className="container mx-auto px-8 relative z-10">
        <motion.h2 
          className="font-space text-5xl md:text-6xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          data-testid="skills-title"
        >
          Technical <span className="text-accent">Arsenal</span>
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
              transition={{ duration: 1, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
              data-testid={`skill-card-${index}`}
            >
              <div className="text-accent text-4xl mb-6">
                <skill.icon size={48} />
              </div>
              <h3 className="font-space text-2xl font-bold mb-4" data-testid={`skill-title-${index}`}>
                {skill.title}
              </h3>
              <ul className="space-y-2 text-gray-300">
                {skill.skills.map((item, skillIndex) => (
                  <li key={item} data-testid={`skill-item-${index}-${skillIndex}`}>
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
