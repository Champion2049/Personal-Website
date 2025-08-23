import { motion } from 'framer-motion';
import { animations } from '@/lib/animations';

const skills = [
  'Python & AI/ML',
  'Full-Stack Development',
  'Data Science',
  'Machine Learning',
  'React & Node.js',
  'Raspberry Pi',
  'JavaScript & TypeScript',
  'Research & Innovation'
];

export function AboutSection() {
  return (
    <section id="about" className="min-h-screen relative py-20 bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900">
      <div className="container mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="morph-container"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="relative">
              <motion.div 
                className="w-full h-96 rounded-3xl shadow-2xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 p-1"
                variants={animations.liquidMorph}
                animate="animate"
                data-testid="about-image"
              >
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎓</div>
                    <p className="text-lg font-mono opacity-80">AI & Data Science Student</p>
                  </div>
                </div>
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl" />
            </div>
          </motion.div>
          
          <div className="space-y-8">
            <motion.h2 
              className="font-space text-5xl md:text-6xl font-bold"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              data-testid="about-title"
            >
              About <span className="text-primary">Me</span>
            </motion.h2>
            
            <motion.div 
              className="space-y-6 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <p data-testid="about-paragraph-1">
                I'm a driven second-year Artificial Intelligence & Data Science student at Amrita Vishwa Vidyapeetham, 
                Bengaluru, with a strong foundation in full-stack development, machine learning, and hardware integration. 
                I maintain a decent CGPA and have proven experience leading technical projects.
              </p>
              
              <p data-testid="about-paragraph-2">
                I recently completed an internship at SigNoz where I architected a Model Context Protocol (MCP) server 
                from scratch using Node.js and TypeScript, integrating official APIs for real-time observability data 
                and ensuring seamless accessibility across GPT-based clients.
              </p>
              
              <p data-testid="about-paragraph-3">
                Beyond academics, I'm actively involved in IEEE societies, conducting sessions/events, 
                participating in rover team projects, and enjoy playing guitar (Trinity Grade 5), badminton, 
                and exploring culinary arts. I'm also quite the fitness enthusiast, and try to regularly hit the gym.
                I'm eager to contribute my diverse skills to solve complex, real-world challenges.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {skills.map((skill, index) => (
                <span 
                  key={skill}
                  className="glass-effect px-4 py-2 rounded-full text-sm font-mono"
                  data-testid={`skill-tag-${index}`}
                >
                  {skill}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
