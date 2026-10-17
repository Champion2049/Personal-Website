import { useEffect, useRef } from 'react';
import { Github, Mail, Phone, Linkedin } from 'lucide-react';
import { IntroSequence } from '@/components/hud/intro-sequence';
import { HudFrame } from '@/components/hud/hud-frame';
import { HeroSection } from '@/components/sections/hero-section';
import { AboutSection } from '@/components/sections/about-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { PublicationsSection } from '@/components/sections/publications-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { GithubSection } from '@/components/sections/github-section';
import { GuestbookSection } from '@/components/sections/guestbook-section';
import { ContactSection } from '@/components/sections/contact-section';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';

const links = [
  { icon: Github, href: 'https://github.com/Champion2049', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/chirayu-chaudhari-086aa3314', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:me.chirayu.6@gmail.com', label: 'Email' },
  { icon: Phone, href: 'tel:+918928833477', label: 'Phone' },
];

export default function Home() {
  const page = useRef<HTMLDivElement>(null);

  // One batched reveal for every [data-reveal] block: a top-down scan wipe, once.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      gsap.set(els, { autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)' });
      ScrollTrigger.batch(els, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.08,
            clearProps: 'clipPath',
          }),
      });
    },
    { scope: page },
  );

  // Triggers are created per component; once everything (including the pinned
  // hero) exists, put them in page order and measure again.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={page} className="overflow-x-clip">
      <IntroSequence />
      <HudFrame />

      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <PublicationsSection />
        <ProjectsSection />
        <GithubSection />
        <GuestbookSection />
        <ContactSection />
      </main>

      {/* Footer: the metadata strip from the spec-sheet references */}
      <footer className="pb-16 md:pb-20">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-6 border-t border-[var(--line)] px-6 pt-8 md:px-10">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Chirayu Nilesh Chaudhari. Press{' '}
            <kbd className="border border-[var(--line-strong)] px-1.5 font-mono text-xs text-foreground">Shift S</kbd> for the shell.
          </p>
          <div className="flex gap-2">
            {links.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center border border-[var(--line-strong)] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
