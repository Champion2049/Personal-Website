import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { Decode } from '@/components/hud/decode';

interface SectionHeadingProps {
  index: string;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
}

/**
 * A "scene" header: decoding label, title that wipes in, a ghost numeral
 * drifting behind it, and a light streak that crosses as you scroll past.
 * Everything scroll-linked is transform/clip only.
 */
export function SectionHeading({ index, kicker, title, description, align = 'left' }: SectionHeadingProps) {
  const root = useRef<HTMLDivElement>(null);
  const isCenter = align === 'center';

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current!;
      gsap.fromTo(
        el.querySelector('[data-ghost]'),
        { yPercent: 25 },
        { yPercent: -25, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      gsap.fromTo(
        el.querySelector('[data-streak]'),
        { xPercent: -120 },
        { xPercent: 320, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 20%', scrub: 0.4 } },
      );
      gsap.from(el.querySelector('[data-title]'), {
        clipPath: 'inset(0% 100% 0% 0%)',
        duration: 0.9,
        ease: 'expo.inOut',
        clearProps: 'clipPath',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
      gsap.from(el.querySelector('[data-rule]'), {
        scaleX: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`relative mb-14 md:mb-20 ${isCenter ? 'mx-auto max-w-3xl text-center' : ''}`}>
      <span
        data-ghost
        aria-hidden
        className={`pointer-events-none absolute -top-[0.35em] select-none font-display text-[clamp(7rem,20vw,18rem)] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_var(--line)] ${isCenter ? 'left-1/2 -translate-x-1/2 opacity-60' : 'right-0'}`}
      >
        {index}
      </span>

      <div className="relative">
        <div className={`flex items-center gap-3 ${isCenter ? 'justify-center' : ''}`}>
          <span className="font-mono text-xs text-primary">{index}</span>
          <span data-rule className="h-px w-10 origin-left bg-primary/60" />
          <Decode text={kicker.toUpperCase()} className="hud-label text-foreground/80" />
        </div>

        <div className="relative mt-3 h-px overflow-hidden bg-[var(--line)]">
          <span data-streak aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_hsl(186_100%_50%/0.8)]" />
        </div>

        <h2
          data-title
          className="relative mt-5 font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight text-balance md:text-6xl lg:text-7xl"
        >
          {title}
        </h2>
        {description && (
          <p className={`relative mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground ${isCenter ? 'mx-auto' : ''}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
