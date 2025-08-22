import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'me.chirayu.6@gmail.com'
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+91 8928833477'
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Bengaluru, India'
  }
];

const socialLinks = [
  { icon: Github, href: 'https://github.com/chirayunilesh', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/chirayu-chaudhari', label: 'LinkedIn' },
];

export function ContactSection() {
  return (
    <section id="contact" className="min-h-screen py-20 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="liquid-bg absolute inset-0 opacity-10" />
      
      <div className="container mx-auto px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="font-space text-5xl md:text-6xl font-bold mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            data-testid="contact-title"
          >
            Let's Build Something <span className="text-accent">Innovative</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            data-testid="contact-description"
          >
            Interested in collaborating on AI/ML projects or full-stack development? 
            Let's connect and work together to solve real-world challenges.
          </motion.p>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {contactInfo.map((info, index) => (
              <div 
                key={info.title}
                className="glass-effect p-6 rounded-2xl text-center"
                data-testid={`contact-info-${index}`}
              >
                <info.icon className="text-3xl text-accent mb-4 mx-auto" size={32} />
                <h3 className="font-space text-xl font-bold mb-2">{info.title}</h3>
                <p className="text-gray-300">{info.value}</p>
              </div>
            ))}
          </motion.div>
          
          <motion.div 
            className="flex justify-center space-x-8 mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {socialLinks.map((social, index) => (
              <a 
                key={social.label}
                href={social.href}
                className="text-2xl hover:text-accent transition-colors duration-300"
                data-testid={`social-link-${social.label.toLowerCase()}`}
              >
                <social.icon size={32} />
              </a>
            ))}
          </motion.div>
          
          <motion.button 
            className="bg-accent px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-orange-400 transition-all duration-500 transform hover:scale-105 animate-pulse-glow"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
            data-testid="button-start-project"
          >
            Start a Project
          </motion.button>
        </div>
      </div>
    </section>
  );
}
