import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface LightboxItem { src: string; title: string; }

export function Lightbox({ item, onClose }: { item: LightboxItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[150] grid place-items-center bg-black/85 backdrop-blur-sm p-6 cursor-zoom-out"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={item.src}
              alt={item.title}
              className="max-h-[82vh] max-w-[88vw] rounded-xl object-contain border border-primary/30"
              style={{ boxShadow: '0 0 60px hsl(2 100% 55% / 0.25)' }}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/85 to-transparent p-4 pointer-events-none">
              <p className="font-display text-lg neon-text">{item.title}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="absolute -top-3 -right-3 grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110">
              <X size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
