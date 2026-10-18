import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home, User, Cpu, Briefcase, FileText, FolderGit2, Github as GithubIcon,
  MessageSquare, Mail, Linkedin, Download, Phone, Joystick, PenLine, Clock,
} from 'lucide-react';

const sections = [
  { id: '#home', label: 'Home', icon: Home },
  { id: '#about', label: 'About', icon: User },
  { id: '#skills', label: 'Skills', icon: Cpu },
  { id: '#experience', label: 'Experience', icon: Briefcase },
  { id: '#publications', label: 'Publications & Honors', icon: FileText },
  { id: '#projects', label: 'Projects', icon: FolderGit2 },
  { id: '#github', label: 'GitHub Activity', icon: GithubIcon },
  { id: '#guestbook', label: 'Guestbook', icon: MessageSquare },
  { id: '#contact', label: 'Contact', icon: Mail },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const onCyber = location.startsWith('/about-me');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const editable =
        !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      // Shift + S opens the palette (ignored while typing in a field).
      if (e.shiftKey && e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey && !e.altKey && !editable) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const openEvt = () => setOpen(true);
    document.addEventListener('keydown', down);
    window.addEventListener('open-command-palette', openEvt);
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', openEvt);
    };
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 120);
  };

  const goToSection = (id: string) => {
    const scroll = () => {
      const el = document.querySelector(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    if (location !== '/') {
      setLocation('/');
      setTimeout(scroll, 360);
    } else {
      scroll();
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className={onCyber ? 'theme-cyber' : ''}>
      <CommandInput placeholder="Jump to a section or run a command…" />
      <CommandList data-lenis-prevent className="max-h-[60vh] overscroll-contain">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {sections.map((s) => (
            <CommandItem key={s.id} value={`go ${s.label}`} onSelect={() => run(() => goToSection(s.id))}>
              <s.icon className="mr-2 h-4 w-4" />
              <span>{s.label}</span>
            </CommandItem>
          ))}
          <CommandItem value="get to know me about personal hobbies games movies" onSelect={() => run(() => window.dispatchEvent(new CustomEvent('enter-grid', { detail: { to: '/about-me' } })))}>
            <Joystick className="mr-2 h-4 w-4" />
            <span>Get to know me</span>
          </CommandItem>
          <CommandItem value="now currently building listening watching reading" onSelect={() => run(() => setLocation('/now'))}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Now</span>
          </CommandItem>
          <CommandItem value="blog writing posts articles" onSelect={() => run(() => setLocation('/blog'))}>
            <PenLine className="mr-2 h-4 w-4" />
            <span>Blog</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Links & Actions">
          <CommandItem value="resume download cv" onSelect={() => run(() => window.open('/Chirayu_Chaudhari_Resume.pdf', '_blank'))}>
            <Download className="mr-2 h-4 w-4" />
            <span>Download résumé</span>
          </CommandItem>
          <CommandItem value="github" onSelect={() => run(() => window.open('https://github.com/Champion2049', '_blank'))}>
            <GithubIcon className="mr-2 h-4 w-4" />
            <span>Open GitHub</span>
          </CommandItem>
          <CommandItem value="linkedin" onSelect={() => run(() => window.open('https://www.linkedin.com/in/chirayu-chaudhari-086aa3314', '_blank'))}>
            <Linkedin className="mr-2 h-4 w-4" />
            <span>Open LinkedIn</span>
          </CommandItem>
          <CommandItem value="email mail copy" onSelect={() => run(() => { navigator.clipboard?.writeText('me.chirayu.6@gmail.com'); window.location.href = 'mailto:me.chirayu.6@gmail.com'; })}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Email me</span>
          </CommandItem>
          <CommandItem value="phone call" onSelect={() => run(() => { window.location.href = 'tel:+918928833477'; })}>
            <Phone className="mr-2 h-4 w-4" />
            <span>Call</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
