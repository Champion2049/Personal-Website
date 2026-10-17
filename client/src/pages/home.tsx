import { useEffect, useRef } from 'react';
import { Github, Mail, Phone, Linkedin } from 'lucide-react';
import { IntroSequence } from '@/components/hud/intro-sequence';
import { HudFrame } from '@/components/hud/hud-frame';
import { Barcode } from '@/components/hud/barcode';
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
      <footer className="pb-20 md:pb-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid border border-[var(--line)] sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr_1.6fr]">
            <div className="flex items-center gap-3 border-b border-[var(--line)] p-4 sm:col-span-2 lg:col-span-1 lg:border-b-0 lg:border-r">
              <span aria-hidden className="grid h-10 w-10 place-items-center border border-primary font-display text-sm font-bold text-primary">C</span>
              <Barcode value="CHIRAYU.DEV" className="h-10 w-28 text-foreground/80" />
            </div>
            {[
              { k: 'Owner', v: 'Chirayu N. Chaudhari' },
              { k: 'Base', v: 'Bengaluru, IN' },
              { k: 'Build', v: 'React · GSAP · 2026' },
            ].map((c) => (
              <div key={c.k} className="border-b border-[var(--line)] p-4 sm:border-r lg:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="hud-label">{c.k}</span>
                  <span aria-hidden className="hatch h-2 flex-1" />
                </div>
                <div className="mt-2 font-mono text-sm text-foreground">{c.v}</div>
              </div>
            ))}
            <div className="p-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <span className="hud-label">Note</span>
                <span aria-hidden className="hatch h-2 flex-1" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                © {new Date().getFullYear()} Chirayu Nilesh Chaudhari. Built on the Grid, with a door to Night City. Press{' '}
                <kbd className="border border-[var(--line-strong)] px-1 font-mono text-[0.65rem] text-foreground">Shift S</kbd> for the shell.
              </p>
              <div className="mt-3 flex gap-2">
                {links.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center border border-[var(--line-strong)] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <s.icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
