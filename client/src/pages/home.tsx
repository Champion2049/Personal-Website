import { Navigation } from '@/components/ui/navigation';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { HeroSection } from '@/components/sections/hero-section';
import { AboutSection } from '@/components/sections/about-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { ContactSection } from '@/components/sections/contact-section';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <ScrollProgress />
      <Navigation />
      
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      
      <footer className="py-12 text-center text-muted-foreground bg-muted/5">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://amrita.town" 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-effect px-4 py-2 rounded-full text-sm hover:text-primary transition-colors"
              >
                amrita.town
              </a>
              <a 
                href="https://amrita.town/prev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-effect px-4 py-2 rounded-full text-sm hover:text-primary transition-colors"
              >
                ← prev
              </a>
              <a 
                href="https://amrita.town/random" 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-effect px-4 py-2 rounded-full text-sm hover:text-primary transition-colors"
              >
                ⚄ random
              </a>
              <a 
                href="https://amrita.town/next" 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-effect px-4 py-2 rounded-full text-sm hover:text-primary transition-colors"
              >
                next →
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://github.com/Champion2049" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a 
                href="mailto:me.chirayu.6@gmail.com" 
                className="hover:text-primary transition-colors"
              >
                Email
              </a>
              <a 
                href="tel:+918928833477" 
                className="hover:text-primary transition-colors"
              >
                Phone
              </a>
            </div>
          </div>
          
          <p className="font-mono">© 2025 Chirayu Nilesh Chaudhari. Crafted with passion and code.</p>
        </div>
      </footer>
    </div>
  );
}
