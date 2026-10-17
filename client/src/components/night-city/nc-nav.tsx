import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { AudioMuteButton } from '@/components/ui/audio-mute-button';

export const NC_TABS = [
  { id: 'character', label: 'Character' },
  { id: 'radio', label: 'Radio' },
  { id: 'anime', label: 'Anime' },
  { id: 'games', label: 'Games' },
  { id: 'screen', label: 'Films & TV' },
  { id: 'vibe', label: 'Vibe check' },
  { id: 'arcade', label: 'Arcade' },
];

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 96;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * The pause-menu bar from Cyberpunk 2077, as in-page navigation: tabs track
 * the section in view, the yellow bar slides to the active one.
 */
export function NCNav() {
  const [active, setActive] = useState(NC_TABS[0].id);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    NC_TABS.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // On narrow screens the tab row scrolls sideways; keep the active tab in view.
  useEffect(() => {
    const row = rowRef.current;
    const tab = row?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - row.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-0 z-40 border-b border-primary/20 bg-[hsl(0_45%_4%/0.94)]"
    >
      <div className="container mx-auto flex h-14 items-center gap-3 px-4 md:px-10">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('enter-grid', { detail: { to: '/', reverse: true } }))}
          className="press group inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-[var(--nc-cyan)]"
        >
          <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Portfolio</span>
        </button>

        <span aria-hidden className="h-5 w-px shrink-0 bg-primary/25" />

        <div ref={rowRef} className="no-scrollbar relative flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_80%,transparent)] lg:[mask-image:none]">
          {NC_TABS.map((t) => {
            const on = active === t.id;
            return (
              <button
                key={t.id}
                data-tab={t.id}
                onClick={() => scrollToSection(t.id)}
                aria-current={on ? 'true' : undefined}
                className={`relative shrink-0 px-2.5 py-4 font-display text-[0.95rem] font-semibold uppercase tracking-wider transition-colors duration-200 md:px-3 ${
                  on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
                {on && (
                  <motion.span
                    layoutId="nc-tab-bar"
                    className="absolute inset-x-2 bottom-0 h-[3px] bg-[var(--nc-yellow)]"
                    transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <AudioMuteButton />
      </div>
    </nav>
  );
}
