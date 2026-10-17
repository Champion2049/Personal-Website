import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/**
 * Night City section shell. The heading wipes in once (clip-path) and the
 * rule underneath draws left to right — that's the only scroll motion; the
 * content itself just sits there and is readable.
 */
export function NCSection({
  id,
  title,
  meta,
  children,
}: {
  id: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 pt-24 md:pt-32">
      <motion.header
        className="mb-8 md:mb-10"
        initial={reduce ? false : 'hidden'}
        whileInView="shown"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <motion.h2
            id={`${id}-title`}
            className="font-display text-4xl font-bold uppercase leading-[0.9] tracking-wide md:text-6xl"
            variants={{
              hidden: { clipPath: 'inset(0 100% 0 0)' },
              shown: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.6, ease: EASE_IN_OUT } },
            }}
          >
            {title}
          </motion.h2>
          {meta && (
            <motion.div
              className="text-sm text-muted-foreground"
              variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { delay: 0.35, duration: 0.3 } } }}
            >
              {meta}
            </motion.div>
          )}
        </div>
        <div className="relative mt-4 h-px">
          <motion.span
            aria-hidden
            className="absolute inset-0 origin-left bg-primary/35"
            variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } } }}
          />
          <span aria-hidden className="absolute left-0 top-1/2 h-[3px] w-12 -translate-y-1/2 bg-[var(--nc-yellow)]" />
        </div>
      </motion.header>
      {children}
    </section>
  );
}
