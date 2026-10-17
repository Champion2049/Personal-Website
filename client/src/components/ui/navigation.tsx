import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, TerminalSquare, Joystick, PenLine } from 'lucide-react';

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
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`relative px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  active === item.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
                {active === item.href && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-primary" />
                )}
              </button>
            ))}
            <Link
              href="/blog"
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-primary transition-colors"
            >
              <PenLine size={13} /> Blog
            </Link>
            {/* A hint of Night City red on the Grid side: this is the door to the personal page */}
            <button
              onClick={enterGrid}
              className="press ml-1 inline-flex items-center gap-1.5 rounded-lg border border-[hsl(350_100%_60%/0.35)] px-3 py-1.5 text-sm text-[hsl(350_100%_66%)] hover:border-[hsl(350_100%_60%/0.7)] hover:bg-[hsl(350_100%_60%/0.1)]"
            >
              <Joystick size={13} />
              <span data-text="Get to know me" className="nc-glitch nc-glitch-hover">Get to know me</span>
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
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

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
              className="col-span-2 inline-flex items-center gap-1.5 py-2 px-2 rounded-lg text-sm text-[hsl(350_100%_66%)] hover:bg-[hsl(350_100%_60%/0.1)]"
            >
              <Joystick size={13} /> Get to know me
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
