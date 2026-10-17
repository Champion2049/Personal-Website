import { useEffect, useState, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/**
 * Leans toward the pointer on a spring, with a soft glare. Decorative, so it
 * only runs for fine pointers and is skipped entirely for reduced motion.
 */
export function TiltCard({ children, className = '', max = 9 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(window.matchMedia('(hover: hover) and (pointer: fine)').matches), []);
  const enabled = fine && !reduce;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 260, damping: 24, mass: 0.5 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, hsl(0 0% 100% / 0.22), transparent 55%)`;

  if (!enabled) return <div className={`relative ${className}`}>{children}</div>;

  return (
    <motion.div
      className={`group/tilt relative ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 700 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{ background: glare }}
      />
    </motion.div>
  );
}
