<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, TerminalSquare, Joystick, PenLine } from 'lucide-react';
=======
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#publications', label: 'Research' },
  { href: '#projects', label: 'Projects' },
  { href: '#github', label: 'GitHub' },
  { href: '#contact', label: 'Contact' },
];

function enterGrid() {
  window.dispatchEvent(new CustomEvent('enter-grid', { detail: { to: '/about-me' } }));
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
<<<<<<< HEAD
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('#home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = navItems.map((n) => n.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
=======
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
<<<<<<< HEAD
    <nav className="fixed top-0 w-full z-40 py-4 px-4 md:px-8">
      <div
        className={`mx-auto max-w-6xl rounded-2xl px-5 md:px-6 py-3 transition-all duration-300 ${
          scrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleNavClick('#home')}
            className="font-mono text-base font-semibold tracking-tight"
          >
            chirayu<span className="text-primary">.dev</span>
          </button>

          <div className="hidden lg:flex items-center gap-1">
=======
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'} px-4 sm:px-8`}>
      <div className={`glass-effect rounded-2xl px-4 sm:px-8 py-3 text-white max-w-6xl mx-auto`}>
        <div className="flex justify-between items-center">
          <div className="font-mono text-lg font-semibold" data-testid="logo">
            CHIRAYU.DEV
          </div>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
<<<<<<< HEAD
                className={`relative px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  active === item.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
=======
                className="transition-all duration-300 hover:text-primary text-sm lg:text-base"
                data-testid={`nav-link-${item.label.toLowerCase()}`}
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
              >
                {item.label}
                {active === item.href && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-primary" />
                )}
              </button>
            ))}
<<<<<<< HEAD
            <Link
              href="/blog"
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-primary transition-colors"
            >
              <PenLine size={13} /> Blog
            </Link>
            <button
              onClick={enterGrid}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-primary hover:bg-primary/10 transition-colors"
            >
              <Joystick size={13} /> Get to know me
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-mono text-[0.7rem] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              aria-label="Open interactive shell"
            >
              <TerminalSquare size={12} /> Shift S
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
=======
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              data-testid="menu-toggle"
              className="z-50"
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
<<<<<<< HEAD

        {isOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-border grid grid-cols-2 gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`text-left py-2 px-2 rounded-lg text-sm transition-colors ${
                  active === item.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="col-span-2 mt-1 inline-flex items-center gap-1.5 py-2 px-2 rounded-lg text-sm text-muted-foreground hover:text-primary"
            >
              <PenLine size={13} /> Blog
            </Link>
            <button
              onClick={() => { setIsOpen(false); enterGrid(); }}
              className="col-span-2 inline-flex items-center gap-1.5 py-2 px-2 rounded-lg text-sm text-primary hover:bg-primary/10"
            >
              <Joystick size={13} /> Get to know me
            </button>
          </div>
        )}
=======
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/20">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full text-left py-2 transition-all duration-300 hover:text-primary"
                    data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
>>>>>>> b5c2ed88b2a4342b7821514017ab764a8d20bb50
      </div>
    </nav>
  );
}
