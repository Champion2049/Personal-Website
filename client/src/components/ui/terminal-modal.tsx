import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { HeroTerminal } from '@/components/ui/hero-terminal';

/**
 * Global interactive shell. Opens as a centered modal on Shift + S
 * (or via the `open-command-palette` event fired from the nav button).
 * Replaces the old command-palette — the terminal does navigation and more.
 */
export function TerminalModal() {
  const [open, setOpen] = useState(false);
  const [instance, setInstance] = useState(0); // reset the shell each time it opens
  const [location] = useLocation();
  const onCyber = location.startsWith('/about-me');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const editable =
        !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

      // Esc closes the shell.
      if (e.key === 'Escape' && open) { setOpen(false); return; }

      // Shift + S toggles it (ignored while typing in a field, incl. the shell itself).
      if (e.shiftKey && e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey && !e.altKey && !editable) {
        e.preventDefault();
        setOpen((o) => { if (!o) setInstance((n) => n + 1); return !o; });
      }
    };
    const openEvt = () => { setInstance((n) => n + 1); setOpen(true); };
    document.addEventListener('keydown', down);
    window.addEventListener('open-command-palette', openEvt);
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', openEvt);
    };
  }, [open]);

  // Opened from the keyboard and used repeatedly: no open/close animation, it's just there.
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] ${onCyber ? 'dark theme-cyber' : ''}`}
      // theme-cyber paints an opaque --background; keep the overlay itself
      // transparent so only the dimming backdrop child shows through.
      style={{ background: 'transparent' }}
      onMouseDown={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/80" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Interactive shell"
        className="relative w-full max-w-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <HeroTerminal key={instance} onClose={() => setOpen(false)} />
      </div>
    </div>
  );
}
