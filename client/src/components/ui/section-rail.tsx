import { useEffect, useState } from 'react';

/**
 * Fixed vertical scroll-spy rail. Highlights the section in view and lets you
 * jump to any of them. Hidden on small screens.
 */
const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'publications', label: 'Research' },
  { id: 'projects', label: 'Projects' },
  { id: 'github', label: 'GitHub' },
  { id: 'contact', label: 'Contact' },
];

export function SectionRail() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            className="group flex items-center gap-2"
            aria-label={s.label}
            aria-current={on ? 'true' : undefined}
          >
            <span
              className={`font-mono text-[0.65rem] uppercase tracking-wider transition-all duration-200 ${
                on ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block rounded-full border transition-all duration-200 ${
                on
                  ? 'h-2.5 w-2.5 border-primary bg-primary shadow-[0_0_10px_var(--tw-shadow-color)] shadow-primary'
                  : 'h-2 w-2 border-muted-foreground/50 bg-transparent group-hover:border-primary'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
