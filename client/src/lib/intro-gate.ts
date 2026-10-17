import { useEffect, useState } from 'react';

/**
 * Full-screen overlays (the boot sequence, the light-cycle transition) hold
 * this gate while they cover the page, so entrance animations underneath wait
 * for the reveal instead of playing unseen behind the overlay.
 */
const EVT = 'intro-gate-change';
const holders = new Set<string>();

export function holdIntro(id: string) {
  if (holders.has(id)) return;
  holders.add(id);
  window.dispatchEvent(new Event(EVT));
}

export function releaseIntro(id: string) {
  if (!holders.delete(id)) return;
  window.dispatchEvent(new Event(EVT));
}

/** True once nothing is covering the page. Stays true after that. */
export function useIntroReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const check = () => setReady((r) => r || holders.size === 0);
    // Wait a frame so overlays mounted in the same commit can claim the gate first.
    const raf = requestAnimationFrame(check);
    window.addEventListener(EVT, check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(EVT, check);
    };
  }, []);
  return ready;
}
