import { Navigation } from '@/components/ui/navigation';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { BootSequence } from '@/components/ui/boot-sequence';
import { SectionRail } from '@/components/ui/section-rail';
import { HeroSection } from '@/components/sections/hero-section';
import { AboutSection } from '@/components/sections/about-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { PublicationsSection } from '@/components/sections/publications-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { GithubSection } from '@/components/sections/github-section';
import { GuestbookSection } from '@/components/sections/guestbook-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Github, Mail, Phone, Linkedin } from 'lucide-react';

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <BootSequence />
      <ScrollProgress />
      <Navigation />
      <SectionRail />

      <main>
        <HeroSection />
        <div className="hairline mx-auto max-w-6xl" />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <PublicationsSection />
        <ProjectsSection />
        <GithubSection />
        <GuestbookSection />
        <ContactSection />
      </main>

      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="font-mono text-base font-semibold">chirayu<span className="text-primary">.dev</span></div>
              <p className="mt-2 text-sm text-muted-foreground">
                AI &amp; Data Science · Bengaluru, India
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { icon: Github, href: 'https://github.com/Champion2049', label: 'GitHub' },
                { icon: Linkedin, href: 'https://www.linkedin.com/in/chirayu-chaudhari-086aa3314', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:me.chirayu.6@gmail.com', label: 'Email' },
                { icon: Phone, href: 'tel:+918928833477', label: 'Phone' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid place-items-center h-10 w-10 rounded-full border border-border text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="hairline my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p className="font-mono">© 2026 Chirayu Nilesh Chaudhari</p>
            <div className="flex flex-wrap justify-center gap-3 font-mono text-xs">
              <a href="https://amrita.town" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">amrita.town</a>
              <a href="https://amrita.town/prev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">← prev</a>
              <a href="https://amrita.town/random" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">⚄ random</a>
              <a href="https://amrita.town/next" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">next →</a>
            </div>
            <p>Press <kbd className="font-mono rounded border border-border px-1.5 py-0.5 text-xs">Shift + S</kbd> to navigate</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
