import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, ArrowUpRight, Copy, Check } from 'lucide-react';
import { useSpotlight } from '@/lib/use-spotlight';

const socials = [
  { icon: Github, href: 'https://github.com/Champion2049', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/chirayu-chaudhari-086aa3314', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:me.chirayu.6@gmail.com', label: 'Email' },
];

export function ContactSection() {
  const { onMouseMove } = useSpotlight();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard?.writeText('me.chirayu.6@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="contact" className="relative py-28 md:py-36 overflow-hidden">
      <div className="glow-blob animate-blob" style={{ width: 520, height: 520, bottom: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, hsl(192 100% 55% / 0.22), transparent 70%)' }} />
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="font-mono text-sm text-primary/70">07</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="kicker">Contact</span>
          </div>
          <h2 className="font-space text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Let's build something <span className="accent-text">worth shipping</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Whether it's an AI/ML collaboration, a full-stack build, research, or just a chat —
            my inbox is open.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:me.chirayu.6@gmail.com?subject=Let's collaborate"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.03] animate-pulse-glow"
            >
              Start a conversation
              <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 font-mono text-sm transition-colors hover:border-primary/50 hover:text-primary"
            >
              {copied ? <><Check size={16} className="text-green-500" /> Copied</> : <><Copy size={16} /> me.chirayu.6@gmail.com</>}
            </button>
          </div>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Mail, label: 'Email', value: 'me.chirayu.6@gmail.com', href: 'mailto:me.chirayu.6@gmail.com' },
            { icon: Phone, label: 'Phone', value: '+91 8928833477', href: 'tel:+918928833477' },
            { icon: MapPin, label: 'Location', value: 'Bengaluru, India', href: undefined },
          ].map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              onMouseMove={onMouseMove}
              className="card-spotlight panel p-5 text-center sm:text-left block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <c.icon size={18} className="text-primary mb-3 mx-auto sm:mx-0" />
              <div className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <div className="mt-1 text-sm break-all">{c.value}</div>
            </motion.a>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="grid place-items-center h-12 w-12 rounded-full border border-border text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:scale-110"
            >
              <s.icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
