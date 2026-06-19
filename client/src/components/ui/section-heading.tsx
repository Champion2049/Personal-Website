import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionHeadingProps {
  index: string;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeading({
  index,
  kicker,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  const isCenter = align === 'center';
  return (
    <motion.div
      className={`mb-14 ${isCenter ? 'text-center mx-auto max-w-2xl' : 'max-w-3xl'}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`flex items-center gap-3 mb-4 ${isCenter ? 'justify-center' : ''}`}>
        <span className="font-mono text-sm text-primary/70">{index}</span>
        <span className="h-px w-8 bg-primary/40" />
        <span className="kicker">{kicker}</span>
      </div>
      <h2 className="font-space text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-balance">
          {description}
        </p>
      )}
    </motion.div>
  );
}
