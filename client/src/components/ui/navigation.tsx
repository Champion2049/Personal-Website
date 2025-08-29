import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#guestbook', label: 'Guestbook' },
  { href: '#contact', label: 'Contact' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'} px-4 sm:px-8`}>
      <div className={`glass-effect rounded-2xl px-4 sm:px-8 py-3 text-white max-w-6xl mx-auto`}>
        <div className="flex justify-between items-center">
          <div className="font-mono text-lg font-semibold" data-testid="logo">
            CHIRAYU.DEV
          </div>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="transition-all duration-300 hover:text-primary text-sm lg:text-base"
                data-testid={`nav-link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              data-testid="menu-toggle"
              className="z-50"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
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
      </div>
    </nav>
  );
}
