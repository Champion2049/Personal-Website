import React, { Suspense } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { ScrollProgress } from '@/components/ui/scroll-progress';

const LazyHeroSection = React.lazy(() => import('@/components/sections/hero-section').then(module => ({ default: module.HeroSection })));
const LazyAboutSection = React.lazy(() => import('@/components/sections/about-section').then(module => ({ default: module.AboutSection })));
const LazySkillsSection = React.lazy(() => import('@/components/sections/skills-section').then(module => ({ default: module.SkillsSection })));
const LazyExperienceSection = React.lazy(() => import('@/components/sections/experience-section').then(module => ({ default: module.ExperienceSection })));
const LazyProjectsSection = React.lazy(() => import('@/components/sections/projects-section').then(module => ({ default: module.ProjectsSection })));
const LazyMediaSection = React.lazy(() => import('@/components/sections/media-section').then(module => ({ default: module.MediaSection })));
const LazySpotifySection = React.lazy(() => import('@/components/sections/spotify-section').then(module => ({ default: module.SpotifySection })));
const LazyGuestbookSection = React.lazy(() => import('@/components/sections/guestbook-section').then(module => ({ default: module.GuestbookSection })));
const LazyContactSection = React.lazy(() => import('@/components/sections/contact-section').then(module => ({ default: module.ContactSection })));

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <ScrollProgress />
      <Navigation />
      
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyHeroSection />
          <LazyAboutSection />
          <LazySkillsSection />
          <LazyExperienceSection />
          <LazyProjectsSection />
          <LazyMediaSection />
          <LazySpotifySection />
          <LazyGuestbookSection />
          <LazyContactSection />
        </Suspense>
      </main>
      
      <footer className="py-12 text-center text-muted-foreground bg-black">
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

          <p className="font-mono text-center">© 2025 Chirayu Nilesh Chaudhari. Crafted with passion and code.</p>
        </div>
      </footer>
    </div>
  );
}
