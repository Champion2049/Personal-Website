import { motion } from 'framer-motion';
<<<<<<< HEAD
import { MapPin, GraduationCap, Cpu, Music2, Dumbbell } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSpotlight } from '@/lib/use-spotlight';
=======
import { animations } from '@/lib/animations';
import DecryptedText from '@/components/ui/decrypted-text';
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50

const facts = [
  { label: 'Based in', value: 'Bengaluru, India' },
  { label: 'Studying', value: 'AI & Data Science' },
  { label: 'Focus', value: 'ML · Agentic AI · DSP' },
  { label: 'Currently', value: 'AI Eng @ ApplyBeeAI' },
];

const interests = [
  { icon: Music2, label: 'Guitar — Trinity Grade 5' },
  { icon: Dumbbell, label: 'Gym & Badminton' },
  { icon: Cpu, label: 'IEEE societies & Rover team' },
];

export function AboutSection() {
  const { onMouseMove } = useSpotlight();

  return (
<<<<<<< HEAD
    <section id="about" className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="01"
          kicker="About"
          title={<>The person behind the <span className="accent-text">commits</span></>}
        />

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <motion.div
            className="lg:col-span-3 space-y-6 text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <p>
              I'm a third-year <span className="text-foreground font-medium">Artificial Intelligence &amp;
              Data Science</span> student at Amrita Vishwa Vidyapeetham, Bengaluru, holding a
              <span className="text-foreground font-medium"> 9.33 CGPA</span>. I work across the full stack
              of modern AI, ranging from raw signal processing and custom neural nets to agentic systems and
              the web apps that wrap them.
            </p>
            <p>
              Most recently I've been an <span className="text-foreground font-medium">AI Engineering
              Intern at ApplyBeeAI</span>, building core NLP and agentic capabilities with LangChain, spaCy
              and Gemini, used for scaling automated pipelines across 7+ applicant tracking systems and shipping
              containerized modules to GCP. Before that, at <span className="text-foreground font-medium">SigNoz</span>
              {' '}I architected a Model Context Protocol (MCP) server from scratch in Node &amp; TypeScript,
              accessible from clients like Cursor, Windsurf and Claude.
            </p>
            <p>
              Beyond the keyboard, I'm active in IEEE societies, and also am a part of the 
              rover team on campus, and recharge with guitar, badminton, and the gym. 
              If any of this resonates with you technically or otherwise, I'd love to have you connect with me.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {interests.map(({ icon: Icon, label }) => (
                <span key={label} className="tag-chip inline-flex items-center gap-2 py-1.5">
                  <Icon size={13} className="text-primary" /> {label}
=======
    <section id="about" className="min-h-screen relative py-20 bg-background">
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
                className="w-full h-96 rounded-3xl shadow-2xl bg-gradient-to-br from-primary via-green-500 to-emerald-500 p-1"
                variants={animations.liquidMorph}
                animate="animate"
                data-testid="about-image"
              >
                <div className="w-full h-full bg-gradient-to-br from-card to-background rounded-3xl flex items-center justify-center">
                  <div className="text-center text-foreground">
                    <div className="text-6xl mb-4">🎓</div>
                    <p className="text-lg font-mono opacity-80">AI & Data Science Student</p>
                  </div>
                </div>
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-green-500/20 rounded-3xl" />
            </div>
          </motion.div>
          
          <div className="space-y-8">
            <motion.h2 
              className="font-space text-5xl md:text-6xl font-bold text-white"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              data-testid="about-title"
            >
              About <span className="text-primary">Me</span>
            </motion.h2>
            
            <motion.div 
              className="space-y-6 text-lg text-white"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <p data-testid="about-paragraph-1">
                <DecryptedText
                  text="Hey there, I'm a second-year Artificial Intelligence & Data Science student at Amrita Vishwa Vidyapeetham, Bengaluru, with a strong foundation in full-stack development, machine learning, and hardware integration. I maintain a decent CGPA and have proven experience leading technical projects."
                  animateOn="view"
                  revealDirection="center"
                />
              </p>
              
              <p data-testid="about-paragraph-2">
                <DecryptedText
                  text="I recently completed an internship at SigNoz where I architected a Model Context Protocol (MCP) server from scratch using Node.js and TypeScript, integrating official APIs for real-time observability data and ensuring seamless accessibility across GPT-based clients."
                  animateOn="view"
                  revealDirection="center"
                />
              </p>
              
              <p data-testid="about-paragraph-3">
                <DecryptedText
                  text="Beyond academics, I'm actively involved in IEEE societies, conducting sessions/events, participating in rover team projects, and enjoy playing guitar (Trinity Grade 5), badminton, and exploring culinary arts. I'm also quite the fitness enthusiast, and try to regularly hit the gym. If I seem like someone you would like to interact with either Technically or Non-Technically, feel free to reach out!"
                  animateOn="view"
                  revealDirection="center"
                />
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
                  className="glass-effect px-4 py-2 rounded-full text-sm font-mono text-white"
                  data-testid={`skill-tag-${index}`}
                >
                  {skill}
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-2 card-spotlight panel p-1 overflow-hidden"
            onMouseMove={onMouseMove}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">chirayu — zsh</span>
            </div>
            <div className="p-5 font-mono text-sm space-y-3">
              <div>
                <span className="text-primary">$</span> whoami
              </div>
              <div className="grid grid-cols-1 gap-2">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="text-foreground text-right">{f.value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-1">
                <span className="text-primary">$</span> cat status.txt
              </div>
              <p className="text-muted-foreground leading-relaxed">
                <GraduationCap size={14} className="inline mb-0.5 mr-1 text-primary" />
                Building, publishing, and competing — one experiment at a time.
              </p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin size={13} className="text-primary" /> 12.9716° N, 77.5946° E
                <span className="ml-1 inline-block w-2 h-4 translate-y-0.5 bg-primary animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
