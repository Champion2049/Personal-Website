import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Instagram, RotateCcw, Check, ArrowRight, Heart } from 'lucide-react';
import { quiz, taste } from '@/lib/personal-data';

const EMAIL = 'me.chirayu.6@gmail.com';
const INSTAGRAM = 'https://instagram.com/me.chirayu6';

function tier(pct: number) {
  if (pct >= 80) return { title: 'Dangerously compatible', msg: "Okay, this is almost suspicious — we'd get along far too well." };
  if (pct >= 50) return { title: "We'd vibe", msg: "Solid overlap. There's plenty here we could talk about for hours." };
  if (pct >= 1) return { title: 'Opposites attract', msg: "Barely any overlap — which honestly makes for the most interesting conversations." };
  return { title: 'Chaotic neutral', msg: "Total mismatch. I'm genuinely curious how your brain works — come argue with me." };
}

export function CompatibilityQuiz({ onMouseMove }: { onMouseMove?: any }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => Array(quiz.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const total = quiz.length;
  const answered = picks[step] != null;
  const isLast = step === total - 1;

  const matches = useMemo(
    () => picks.reduce<number>((n, p, i) => n + (p != null && quiz[i].options[p]?.mine ? 1 : 0), 0),
    [picks],
  );
  const pct = Math.round((matches / total) * 100);
  const t = tier(pct);

  const choose = (i: number) => {
    if (picks[step] != null) return;
    setPicks((prev) => { const next = [...prev]; next[step] = i; return next; });
  };
  const advance = () => { if (isLast) setShowResults(true); else setStep((s) => s + 1); };
  const reset = () => { setPicks(Array(total).fill(null)); setStep(0); setShowResults(false); };

  // ----- Results screen -----
  if (showResults) {
    const R = 54, C = 2 * Math.PI * R;
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(`We're ${pct}% compatible`)}&body=${encodeURIComponent(`Hey Chirayu — your Night City quiz says we're ${pct}% compatible. Figured I'd say hi.`)}`;
    return (
      <motion.div
        onMouseMove={onMouseMove}
        className="card-spotlight panel p-6 md:p-8 max-w-3xl"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
              <circle cx="64" cy="64" r={R} fill="none" stroke="hsl(345 28% 16%)" strokeWidth="8" />
              <motion.circle
                cx="64" cy="64" r={R} fill="none" strokeWidth="8" strokeLinecap="round"
                stroke="url(#compat)" strokeDasharray={C}
                initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="compat" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(350 100% 62%)" />
                  <stop offset="100%" stopColor="hsl(320 100% 62%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <motion.span
                className="font-display text-4xl font-bold text-primary"
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
              >
                {pct}%
              </motion.span>
            </div>
          </div>

          <h3 className="mt-5 font-display text-2xl font-bold">{t.title}</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{t.msg}</p>
          <p className="mt-1 font-mono text-xs text-primary/70">{matches} / {total} of your picks matched mine</p>
        </div>

        {/* Reveal: what I actually love */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={15} className="text-primary" />
            <h4 className="font-space text-sm font-semibold uppercase tracking-wide">Here's what I actually love</h4>
          </div>
          <div className="space-y-3">
            {taste.map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{item.label}</span>
                  <span className="font-mono text-xs text-primary">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, hsl(350 100% 62%), hsl(320 100% 62%))', boxShadow: '0 0 12px hsl(350 100% 60% / 0.6)' }}
                    initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect nudge */}
        <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-5 text-center">
          <p className="flex items-center justify-center gap-2 font-space font-semibold">
            Wanna get to know me better?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pct >= 50 ? "We clearly have taste in common — slide in." : "Opposites make the best debates — come change my mind."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={mailto}
              className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Mail size={16} /> Email me
            </a>
            <a
              href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Instagram size={16} /> @me.chirayu6
            </a>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button onClick={reset} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary">
            <RotateCcw size={13} /> Retake the quiz
          </button>
        </div>
      </motion.div>
    );
  }

  // ----- Question screen -----
  const cur = quiz[step];
  return (
    <div onMouseMove={onMouseMove} className="card-spotlight panel p-6 md:p-8 max-w-3xl">
      {/* progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-2">
          <span>Compatibility check</span>
          <span>{step + 1} / {total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false} animate={{ width: `${((step + (answered ? 1 : 0)) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-display text-xl md:text-2xl font-bold mb-5">{cur.q}</h3>

          <div className="grid sm:grid-cols-2 gap-3">
            {cur.options.map((opt, i) => {
              const chosen = picks[step] === i;
              let cls = 'border-border hover:border-primary/50 hover:bg-primary/5';
              if (answered) {
                if (opt.mine) cls = 'border-emerald-400/60 bg-emerald-400/10';
                else if (chosen) cls = 'border-primary/50 bg-primary/10';
                else cls = 'border-border opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`relative text-left rounded-xl border px-4 py-3.5 text-sm transition-all ${cls} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span>{opt.text}</span>
                  {answered && opt.mine && (
                    <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[0.65rem] text-emerald-400">
                      <Check size={11} /> {chosen ? 'My pick — you matched!' : 'My pick'}
                    </span>
                  )}
                  {answered && chosen && !opt.mine && (
                    <span className="mt-1.5 block font-mono text-[0.65rem] text-muted-foreground">your pick</span>
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }} className="overflow-hidden"
              >
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-background/40 p-3.5">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground italic">{cur.reveal}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={advance}
                    className="btn-shine inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    {isLast ? 'See our score' : 'Next'} <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
