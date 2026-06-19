import { MouseEvent } from 'react';

/**
 * Returns an onMouseMove handler that drives the --mx / --my CSS variables
 * used by the `.card-spotlight` class for a cursor-following glow.
 */
export function useSpotlight() {
  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };
  return { onMouseMove };
}
