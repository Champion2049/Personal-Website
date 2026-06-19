import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] ${onCyber ? 'dark theme-cyber' : ''}`}
          // theme-cyber paints an opaque --background; keep the overlay itself
          // transparent so only the dimming backdrop child shows through.
          style={{ background: 'transparent' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={() => setOpen(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />

          <motion.div
            className="relative w-full max-w-2xl"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-1 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
              <span><span className="text-primary">//</span> interactive shell — type a command</span>
              <span className="hidden sm:inline">esc to close</span>
            </div>
            <HeroTerminal key={instance} onClose={() => setOpen(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
