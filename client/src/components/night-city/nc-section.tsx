import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

/**
 * Night City section shell. As the header scrolls in, the title's letters
 * assemble from scattered, skewed fragments (scrubbed, so scrolling back up
 * scatters them again), the rule draws across, and a ghost index drifts behind.
 * Transform/opacity only; static for reduced motion.
 */
export function NCSection({
  id,
  index,
  title,
  meta,
  children,
}: {
  id: string;
  index: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  const head = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = head.current!;
      const st = { trigger: el, start: 'top 90%', end: 'top 50%', scrub: 0.6 };
      const rand = gsap.utils.random;
      gsap.from(el.querySelectorAll('[data-ch]'), {
        xPercent: () => rand(-60, 60),
        yPercent: () => rand(-160, 160),
        skewX: () => rand(-30, 30),
        autoAlpha: 0,
        ease: 'power3.out',
        stagger: { each: 0.025, from: 'random' },
        scrollTrigger: st,
      });
      gsap.fromTo(el.querySelector('[data-rule]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: st });
      gsap.from(el.querySelector('[data-meta]'), { autoAlpha: 0, y: 12, ease: 'none', scrollTrigger: { ...st, start: 'top 75%' } });
      const ghost = el.querySelector('[data-ghost]');
      gsap.fromTo(ghost, { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to(ghost, {
        duration: 1,
        ease: 'none',
        scrambleText: { text: index, chars: '0123456789', speed: 0.5 },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    },
    { scope: head },
  );

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 pt-24 md:pt-36">
      <header ref={head} className="relative mb-8 md:mb-12">
        <span
          data-ghost
          aria-hidden
          className="pointer-events-none absolute -top-[0.3em] right-0 select-none font-display text-[clamp(6rem,17vw,15rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_hsl(2_100%_60%/0.2)]"
        >
          {index}
        </span>
        <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2
            id={`${id}-title`}
            aria-label={title}
            className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-wide md:text-7xl"
          >
            {title.split(' ').map((word, w) => (
              <span key={w} aria-hidden className="inline-block whitespace-nowrap">
                {word.split('').map((ch, i) => (
                  <span key={i} data-ch className="inline-block">
                    {ch}
                  </span>
                ))}
                {w < title.split(' ').length - 1 && <span className="inline-block">&nbsp;</span>}
              </span>
            ))}
          </h2>
          {meta && (
            <div data-meta className="text-sm text-muted-foreground">
              {meta}
            </div>
          )}
        </div>
        <div className="relative mt-4 h-px">
          <span data-rule aria-hidden className="absolute inset-0 origin-left bg-primary/35" />
          <span aria-hidden className="absolute left-0 top-1/2 h-[3px] w-12 -translate-y-1/2 bg-[var(--nc-yellow)]" />
        </div>
      </header>
      {children}
    </section>
  );
}
