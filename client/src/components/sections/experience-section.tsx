import { motion } from 'framer-motion';
import { Building2, Calendar, MapPin } from 'lucide-react';

const experienceData = [
  {
    company: 'SigNoz',
    position: 'Intern',
    period: 'May 2025 – Jul 2025',
    location: 'Bengaluru, Karnataka',
    description: [
      'Architected and developed a Model Context Protocol (MCP) server from scratch using Node.js and TypeScript to streamline data access for AI-powered clients.',
      'Integrated official SigNoz APIs to fetch and process real-time trace and log data, enabling comprehensive observability.',
      'Engineered the server to ensure seamless accessibility from various GPT-based clients, including Cursor, Windsurf, and Claude.',
      'Conducted research on existing solutions, such as Honeycomb\'s MCP, to improve the server\'s design and implementation strategy.'
    ]
  }
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
    'Toastmasters International: Improving networking and conversational skills'
  ]
};

export function ExperienceSection() {
  return (
    <section id="experience" className="min-h-screen py-20 bg-gradient-to-br from-slate-900 via-primary/10 to-slate-900">
      <div className="container mx-auto px-8">
        <motion.h2 
          className="font-space text-5xl md:text-6xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          Experience & <span className="text-primary">Education</span>
        </motion.h2>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experience */}
          <div className="space-y-8">
            <motion.h3 
              className="font-space text-3xl font-bold mb-8"
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
                className="glass-effect p-8 rounded-3xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-space text-2xl font-bold text-primary">{exp.company}</h4>
                    <p className="text-xl font-semibold">{exp.position}</p>
                  </div>
                  <Building2 className="text-primary" size={32} />
                </div>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
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
                    <li key={descIndex} className="text-muted-foreground">
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
              className="font-space text-3xl font-bold mb-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Education
            </motion.h3>
            
            <motion.div
              className="glass-effect p-8 rounded-3xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-6">
                <h4 className="font-space text-xl font-bold text-primary mb-2">{educationData.degree}</h4>
                <p className="text-lg font-semibold">{educationData.institution}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                <h5 className="font-semibold mb-3">Clubs & Activities:</h5>
                <ul className="space-y-2">
                  {educationData.achievements.map((achievement, achIndex) => (
                    <li key={achIndex} className="text-muted-foreground text-sm">
                      • {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}