import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP, DECODE_CHARS, prefersReducedMotion } from '@/lib/gsap';
import { useLenis } from '@/components/ui/lenis-scroll-provider';
import { SCENES } from './scenes';

const pad = (n: number) => String(n).padStart(2, '0');
const RULER = Array.from({ length: 12 }, (_, i) => 12 - i);
const SIDE = ['A', 'B', 'C', 'D', 'E', 'F'];

function useIST() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 20_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function enterNightCity() {
  window.dispatchEvent(new CustomEvent('enter-grid', { detail: { to: '/about-me' } }));
}

/**
 * Fixed HUD around the portfolio (after the scroll reference + the spec-sheet
 * posters): ruler that fills with scroll progress, slash-path nav, a scene
 * counter that decodes as you move between sections, and Bengaluru time.
 */
export function HudFrame() {
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  const progress = useRef<HTMLDivElement>(null);
  const sceneLabel = useRef<HTMLSpanElement>(null);
  const time = useIST();

  useGSAP(() => {
    gsap.fromTo(progress.current, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    SCENES.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => self.isActive && setActive(i),
      });
    });
  });

  // The scene label decodes each time the active section changes.
  useEffect(() => {
    const el = sceneLabel.current;
    if (!el) return;
    const text = SCENES[active].label.toUpperCase();
    if (prefersReducedMotion()) {
      el.textContent = text;
      return;
    }
    const tween = gsap.to(el, { duration: 0.6, ease: 'none', scrambleText: { text, chars: DECODE_CHARS, speed: 0.8 } });
    return () => {
      tween.kill();
    };
  }, [active]);

  const go = (id: string) => {
    setMenu(false);
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: id === 'home' ? 0 : -72, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  const openShell = () => window.dispatchEvent(new CustomEvent('open-command-palette'));
  const scene = SCENES[active];

  return (
    <>
      {/* Frame + corner handles (decorative) */}
      <div aria-hidden className="pointer-events-none fixed inset-2 z-40 hidden border border-[var(--line)] md:block lg:inset-3">
        {['-left-[3px] -top-[3px]', '-right-[3px] -top-[3px]', '-left-[3px] -bottom-[3px]', '-right-[3px] -bottom-[3px]'].map((p) => (
          <span key={p} className={`absolute h-[5px] w-[5px] bg-foreground/70 ${p}`} />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-3 flex-col items-center justify-evenly xl:flex">
        {SIDE.map((l) => <span key={l} className="font-mono text-[0.55rem] text-muted-foreground/60">{l}</span>)}
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden w-3 flex-col items-center justify-evenly xl:flex">
        {SIDE.map((l) => <span key={l} className="font-mono text-[0.55rem] text-muted-foreground/60">{l}</span>)}
      </div>

      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-50 md:inset-x-2 md:top-2 lg:inset-x-3 lg:top-3">
        <div className="flex h-12 items-center gap-4 border-b border-[var(--line)] bg-background/95 px-4 md:px-5">
          <button onClick={() => go('home')} className="group flex items-center gap-2.5" aria-label="Back to top">
            <span aria-hidden className="grid h-6 w-6 place-items-center border border-primary text-[0.6rem] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              C
            </span>
            <span className="font-display text-sm font-bold tracking-[0.18em]">CHIRAYU</span>
            <span className="hidden font-mono text-[0.65rem] text-muted-foreground sm:inline">.DEV</span>
          </button>

          <nav aria-label="Sections" className="ml-auto hidden items-center xl:flex">
            {SCENES.slice(1).filter((s) => s.id !== 'guestbook').map((s) => {
              const on = scene.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => go(s.id)}
                  aria-current={on ? 'true' : undefined}
                  className={`relative px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors ${on ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  /{s.label}
                  {on && <span className="absolute -bottom-[13px] left-2.5 right-2.5 h-[2px] bg-primary" />}
                </button>
              );
            })}
            <Link href="/blog" className="px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground">
              /Blog
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-3">
            <button
              onClick={openShell}
              className="hidden items-center gap-2 border border-[var(--line-strong)] px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-primary hover:text-primary md:inline-flex"
            >
              Shell <kbd className="text-[0.6rem] text-muted-foreground/70">⇧S</kbd>
            </button>
            <button
              onClick={enterNightCity}
              className="press inline-flex items-center gap-2 border border-[hsl(2_100%_60%/0.5)] bg-[hsl(2_100%_60%/0.08)] px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[hsl(2_100%_68%)] hover:border-[hsl(2_100%_60%)] hover:bg-[hsl(2_100%_60%/0.16)]"
            >
              <span className="h-1.5 w-1.5 bg-[hsl(2_100%_60%)]" />
              <span data-text="Night City" className="nc-glitch nc-glitch-hover">Night City</span>
            </button>
            <button onClick={() => setMenu((m) => !m)} className="p-1.5 text-muted-foreground xl:hidden" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Ruler: ticks + numbers, filled with scroll progress */}
        <div aria-hidden className="relative hidden h-4 border-b border-[var(--line)] bg-background/95 md:block">
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--line-strong) 0 1px, transparent 1px 8px)' }}
          />
          <div className="absolute inset-x-3 bottom-0 flex justify-between font-mono text-[0.5rem] leading-none text-muted-foreground/70">
            {RULER.map((n) => <span key={n}>{n}</span>)}
          </div>
          <div ref={progress} className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-primary shadow-[0_0_8px_hsl(186_100%_50%/0.8)]" />
        </div>

        {/* Mobile menu */}
        {menu && (
          <nav aria-label="Sections" className="border-b border-[var(--line)] bg-background px-4 pb-4 pt-2 xl:hidden">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={`flex w-full items-baseline gap-3 border-b border-[var(--line)] py-3 text-left ${scene.id === s.id ? 'text-primary' : 'text-foreground'}`}
              >
                <span className="font-mono text-xs text-muted-foreground">{pad(i)}</span>
                <span className="font-display text-lg font-bold uppercase tracking-wide">{s.label}</span>
              </button>
            ))}
            <div className="mt-4 flex gap-2">
              <Link href="/blog" onClick={() => setMenu(false)} className="btn-hud btn-hud-ghost flex-1 py-2.5">Blog</Link>
              <button onClick={() => { setMenu(false); openShell(); }} className="btn-hud btn-hud-ghost flex-1 py-2.5">Shell</button>
            </div>
          </nav>
        )}
      </header>

      {/* Bottom status: scene counter + place/time */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between px-4 pb-3 md:inset-x-2 md:bottom-2 md:px-5 lg:inset-x-3 lg:bottom-3">
        <div className="flex items-baseline gap-3 bg-background/90 pr-3 pt-1">
          <span className="font-mono text-xs text-primary">
            {pad(active)}<span className="text-muted-foreground">/{pad(SCENES.length - 1)}</span>
          </span>
          <span ref={sceneLabel} className="hud-label min-w-[9ch] text-foreground/90" />
        </div>
        <div className="hidden items-baseline gap-3 bg-background/90 pl-3 pt-1 md:flex">
          <span className="hud-label">12.97°N 77.59°E</span>
          <span className="font-mono text-xs text-foreground/90">BLR {time} IST</span>
        </div>
      </div>
    </>
  );
}
