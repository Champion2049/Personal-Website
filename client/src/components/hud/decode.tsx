import { useRef, type ElementType } from 'react';
import { gsap, useGSAP, DECODE_CHARS, prefersReducedMotion } from '@/lib/gsap';

/**
 * Text that decodes out of glyph noise (GSAP ScrambleText), once — when it
 * scrolls into view, or right away with trigger="mount". The real text is
 * always the accessible name; only the visible copy scrambles.
 */
export function Decode({
  text,
  as: Tag = 'span',
  className = '',
  trigger = 'view',
  delay = 0,
  duration = 0.9,
  start = 'top 85%',
}: {
  text: string;
  as?: ElementType;
  className?: string;
  trigger?: 'view' | 'mount';
  delay?: number;
  duration?: number;
  start?: string;
}) {
  const inner = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = inner.current;
      if (!el || prefersReducedMotion()) return;
      const scrambled = text.replace(/\S/g, () => DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)]);
      el.textContent = scrambled;
      gsap.to(el, {
        duration,
        delay,
        ease: 'none',
        scrambleText: { text, chars: DECODE_CHARS, revealDelay: duration * 0.35, speed: 0.7 },
        scrollTrigger: trigger === 'view' ? { trigger: el, start, once: true } : undefined,
      });
    },
    { dependencies: [text], revertOnUpdate: true },
  );

  return (
    <Tag className={className} aria-label={text}>
      <span ref={inner} aria-hidden>
        {text}
      </span>
    </Tag>
  );
}
