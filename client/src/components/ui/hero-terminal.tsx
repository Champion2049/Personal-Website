import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Barcode } from '@/components/hud/barcode';

type Line = { kind: 'in' | 'out' | 'sys' | 'err'; text: string };

const HELP: [string, string][] = [
  ['help', 'show this list'],
  ['whoami', 'who is Chirayu'],
  ['about', 'jump to the About section'],
  ['skills', 'jump to Skills'],
  ['experience', 'jump to Experience'],
  ['research', 'jump to Publications & honors'],
  ['projects', 'jump to Projects'],
  ['github', 'jump to live GitHub stats'],
  ['contact', 'jump to Contact'],
  ['resume', 'open my résumé (PDF)'],
  ['blog', 'open the blog'],
  ['nightcity', 'enter the "get to know me" page'],
  ['social', 'github / linkedin / email'],
  ['neofetch', 'system readout'],
  ['clear', 'clear the screen'],
];

function scrollToId(hash: string) {
  const el = document.querySelector(hash);
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    return true;
  }
  return false;
}

export function HeroTerminal({ onClose }: { onClose?: () => void }) {
  const [, setLocation] = useLocation();
  const [lines, setLines] = useState<Line[]>([
    { kind: 'sys', text: "Type 'help' and hit Enter, or tap a command above." },
  ]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Focus the prompt as soon as the shell appears (e.g. opened via Shift + S).
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const push = (...l: Line[]) => setLines((prev) => [...prev, ...l]);
  // Close the host modal (if any) shortly after a command that navigates away,
  // so the visitor actually sees where they landed.
  const closeSoon = () => { if (onClose) setTimeout(onClose, 480); };

  const run = (raw: string) => {
    const cmd = raw.trim();
    push({ kind: 'in', text: cmd });
    if (!cmd) return;
    setHistory((h) => [cmd, ...h].slice(0, 40));
    setHIndex(-1);

    const [name, ...rest] = cmd.toLowerCase().split(/\s+/);
    const arg = rest.join(' ');

    const jump = (hash: string, label: string) => {
      const ok = scrollToId(hash);
      push({ kind: ok ? 'out' : 'err', text: ok ? `→ navigating to ${label}…` : `section ${label} not found here` });
      if (ok) closeSoon();
    };

    switch (name) {
      case 'help':
        push(...HELP.map(([c, d]) => ({ kind: 'out' as const, text: `${c.toUpperCase().padEnd(11, '.')}.. ${d}` })));
        break;
      case 'whoami':
        push(
          { kind: 'out', text: 'Chirayu Nilesh Chaudhari' },
          { kind: 'out', text: 'AI & Data Science engineer · IEEE-published · ICPC Regionalist.' },
          { kind: 'out', text: 'I ship ML pipelines, agentic AI tooling, and embedded experiments.' },
        );
        break;
      case 'about': jump('#about', 'About'); break;
      case 'skills': jump('#skills', 'Skills'); break;
      case 'experience': case 'exp': jump('#experience', 'Experience'); break;
      case 'research': case 'publications': case 'papers': jump('#publications', 'Research'); break;
      case 'projects': case 'work': jump('#projects', 'Projects'); break;
      case 'github': case 'gh': jump('#github', 'GitHub'); break;
      case 'contact': jump('#contact', 'Contact'); break;
      case 'ls':
        push({ kind: 'out', text: 'about  skills  experience  research  projects  github  contact  blog' });
        break;
      case 'resume': case 'cv':
        push({ kind: 'out', text: 'opening résumé.pdf …' });
        window.open('/Chirayu_Chaudhari_Resume.pdf', '_blank', 'noopener');
        closeSoon();
        break;
      case 'blog':
        push({ kind: 'out', text: 'loading /blog …' });
        setTimeout(() => setLocation('/blog'), 250);
        closeSoon();
        break;
      case 'nightcity': case 'gettoknowme':
        push({ kind: 'out', text: 'jacking into Night City …' });
        window.dispatchEvent(new CustomEvent('enter-grid', { detail: { to: '/about-me' } }));
        closeSoon();
        break;
      case 'social':
        push(
          { kind: 'out', text: 'github   https://github.com/Champion2049' },
          { kind: 'out', text: 'linkedin https://www.linkedin.com/in/chirayu-chaudhari-086aa3314' },
          { kind: 'out', text: 'email    me.chirayu.6@gmail.com' },
        );
        break;
      case 'email':
        push({ kind: 'out', text: 'me.chirayu.6@gmail.com (copied)' });
        navigator.clipboard?.writeText('me.chirayu.6@gmail.com').catch(() => {});
        break;
      case 'echo':
        push({ kind: 'out', text: arg || '' });
        break;
      case 'date':
        push({ kind: 'out', text: new Date().toString() });
        break;
      case 'neofetch':
        push(
          { kind: 'sys', text: 'chirayu@portfolio' },
          { kind: 'out', text: '-----------------' },
          { kind: 'out', text: 'OS      TRON / Night City build' },
          { kind: 'out', text: 'Stack   React · TypeScript · Python · PyTorch' },
          { kind: 'out', text: 'Focus   ML · Agentic AI · Signal Processing' },
          { kind: 'out', text: 'CGPA    9.33   Papers 3   ICPC Regionalist' },
          { kind: 'out', text: 'Year    3rd-year AI & DS' },
        );
        break;
      case 'exit': case 'quit': case 'q':
        push({ kind: 'out', text: 'closing shell …' });
        closeSoon();
        break;
      case 'sudo':
        push({ kind: 'err', text: "nice try — you don't have root on my portfolio :)" });
        break;
      case 'clear': case 'cls':
        setLines([]);
        break;
      default:
        push({ kind: 'err', text: `command not found: ${name}. type 'help'.` });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(value);
      setValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length) {
        const ni = Math.min(hIndex + 1, history.length - 1);
        setHIndex(ni);
        setValue(history[ni] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const ni = Math.max(hIndex - 1, -1);
      setHIndex(ni);
      setValue(ni === -1 ? '' : history[ni] || '');
    }
  };

  const QUICK = ['whoami', 'projects', 'resume', 'nightcity', 'help'];

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="relative border border-[var(--line-strong)] bg-background font-mono text-[0.8rem]"
    >
      {/* Window chrome, after the IP.AXIS browser frame */}
      <div className="flex items-center gap-3 border-b border-[var(--line-strong)] px-3 py-2">
        <span aria-hidden className="h-3 w-3 border border-primary bg-primary/20" />
        <span className="flex-1 truncate text-[0.7rem] uppercase tracking-[0.14em] text-foreground/85">https://chirayu.dev/shell</span>
        <span aria-hidden className="hidden text-[0.75rem] text-muted-foreground sm:inline">_ ▢</span>
        {onClose && (
          <button onClick={onClose} aria-label="Close shell" className="grid h-5 w-5 place-items-center border border-[var(--line-strong)] text-[0.7rem] text-muted-foreground transition-colors hover:border-[var(--signal)] hover:text-[var(--signal)]">
            ✕
          </button>
        )}
      </div>
      <div aria-hidden className="flex justify-between border-b border-[var(--line)] px-3 py-0.5 text-[0.5rem] text-muted-foreground/70" style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 8px)' }}>
        {Array.from({ length: 12 }, (_, i) => <span key={i}>{12 - i}</span>)}
      </div>

      {/* Quick commands */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--line)] px-3 py-2">
        {QUICK.map((c) => (
          <button
            key={c}
            onClick={(e) => { e.stopPropagation(); run(c); }}
            className="tag-chip text-muted-foreground hover:border-primary hover:text-primary"
          >
            {c}
          </button>
        ))}
      </div>

      <div ref={scrollRef} data-lenis-prevent className="h-60 overflow-y-auto px-4 py-3 leading-relaxed">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-primary">Chirayu.dev // interactive shell</span>
          <Barcode value="SHELL" className="h-4 w-20 text-foreground/40" />
        </div>
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === 'in' ? 'text-foreground' :
              l.kind === 'err' ? 'text-[var(--signal)]' :
              l.kind === 'sys' ? 'text-primary' : 'text-muted-foreground'
            }
          >
            {l.kind === 'in' ? <span className="text-primary">▸ </span> : null}
            <span className="whitespace-pre-wrap break-words">{l.text}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2">
          <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.12em] text-primary">visitor@grid ▸</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Shell command"
            className="flex-1 bg-transparent text-foreground caret-[var(--signal)] outline-none placeholder:text-muted-foreground/50"
            placeholder="type 'help'"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{history.length} cmds this session</span>
        <span className="hidden sm:inline">↑↓ history · enter run · esc close</span>
      </div>
    </div>
  );
}
