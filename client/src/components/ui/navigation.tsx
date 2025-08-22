import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLenis } from './lenis-scroll-provider';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();

  const handleNavClick = (href: string) => {
    lenis.scrollTo(href, {
      duration: 2.5,
      easing: (t: number) => {
        // Smooth cubic bezier easing
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
      offset: -80
    });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-40 py-6 px-8">
      <div className="glass-effect rounded-2xl px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="font-mono text-lg font-semibold" data-testid="logo">
            CHIRAYU.DEV
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="transition-all duration-300 hover:text-primary"
                data-testid={`nav-link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </button>
            ))}
            <ThemeToggle />
          </div>
          
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              data-testid="menu-toggle"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/20">
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
        )}
      </div>
    </nav>
  );
}
