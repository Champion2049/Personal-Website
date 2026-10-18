import { useEffect } from 'react';

/**
 * Pauses the infinite CSS animations (pulsing dots, equalizer bars, the
 * arcade's attract screen) inside every `<section>` under `root` while that
 * section is out of view, and resumes them when it's back. It pauses the
 * Animation objects directly, so toggling never restyles the section's subtree.
 */
export function usePauseOffscreen(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const sections = root.current?.querySelectorAll('section');
    if (!sections?.length || !('getAnimations' in Element.prototype)) return;
    const loops = (el: Element) =>
      el.getAnimations({ subtree: true }).filter((a) => a.effect?.getTiming().iterations === Infinity && 'animationName' in a);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) for (const a of loops(e.target)) e.isIntersecting ? a.play() : a.pause();
      },
      { rootMargin: '100px 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [root]);
}
