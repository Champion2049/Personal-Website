import { useState } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, ArrowUpRight, Copy, Check } from 'lucide-react';
import { Barcode } from '@/components/hud/barcode';

const EMAIL = 'me.chirayu.6@gmail.com';

const channels = [
  { icon: Mail, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: Phone, label: 'Phone', value: '+91 8928833477', href: 'tel:+918928833477' },
  { icon: MapPin, label: 'Location', value: 'Bengaluru, India', href: undefined },
  { icon: Github, label: 'GitHub', value: '@Champion2049', href: 'https://github.com/Champion2049' },
  { icon: Linkedin, label: 'LinkedIn', value: 'chirayu-chaudhari', href: 'https://www.linkedin.com/in/chirayu-chaudhari-086aa3314' },
];

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-40">
      <div className="container relative z-10 mx-auto px-6 md:px-10">
        <h2 data-reveal className="font-display font-extrabold uppercase leading-[0.86] tracking-tight">
          <span className="block text-[clamp(2.8rem,9vw,8rem)]">Let's build</span>
          <span className="block text-[clamp(2.8rem,9vw,8rem)] text-transparent [-webkit-text-stroke:2px_hsl(186_100%_50%)]">something</span>
          <span className="block text-[clamp(2.8rem,9vw,8rem)]">worth shipping</span>
        </h2>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-5">
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              Whether it's an AI/ML collaboration, a full-stack build, research, or just a chat — my inbox is open.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${EMAIL}?subject=Let's collaborate`} className="btn-hud group">
                Start a conversation
                <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <button onClick={copyEmail} className="btn-hud btn-hud-ghost normal-case tracking-normal" aria-live="polite">
                {copied ? <><Check size={15} className="text-primary" /> Copied</> : <><Copy size={15} /> {EMAIL}</>}
              </button>
            </div>
          </div>

          <div data-reveal className="panel lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-2.5">
              <span className="hud-label">Channels</span>
              <span className="hud-label">Status <span className="text-primary">Open</span></span>
            </div>
            <ul className="divide-y divide-[var(--line)]">
              {channels.map((c) => {
                const row = (
                  <>
                    <c.icon size={15} className="shrink-0 text-primary" />
                    <span className="hud-label w-20 shrink-0">{c.label}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{c.value}</span>
                    {c.href && <ArrowUpRight size={14} className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />}
                  </>
                );
                return (
                  <li key={c.label}>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-primary/5"
                      >
                        {row}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 px-5 py-3.5">{row}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-4 border-t border-[var(--line)] px-5 py-3">
              <Barcode value={EMAIL} className="h-7 flex-1 text-foreground/50" />
              <span className="hud-label">BLR/IN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
