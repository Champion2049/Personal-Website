import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Headphones, Tv, Gamepad2, BookOpen } from 'lucide-react';
import { identity, attributes, now, socials } from '@/lib/personal-data';
import { useIntroReady } from '@/lib/intro-gate';
import { scrollToSection } from './nc-nav';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const GLYPHS = '!<>-_\\/[]{}=+*^?#01XZ';
const MAX_ATTR = 20;

/** Decode `text` out of noise over `ms`, left to right. */
function useScramble(text: string, run: boolean, ms = 750) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const settled = Math.floor(k * text.length);
      setOut(
        text
          .split('')
          .map((c, i) => (i < settled || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, text, ms]);
  return out;
}

function useLocalTime(timeZone: string) {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function NCHero() {
  const reduce = useReducedMotion();
  const ready = useIntroReady();
  const play = ready && !reduce;
  const handle = identity.handle.toUpperCase();
  const scrambled = useScramble(handle, play);
  const [glitching, setGlitching] = useState(false);
  const time = useLocalTime(identity.timeZone);

  useEffect(() => {
    if (!play) return;
    setGlitching(true);
    const t = setTimeout(() => setGlitching(false), 800);
    return () => clearTimeout(t);
  }, [play]);

  // Before the overlay lifts, hold everything in its pre-entrance state.
  const state = reduce || ready ? 'shown' : 'hidden';
  const fade = (delay: number) => ({
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, delay, ease: EASE_OUT } },
  });

  return (
    <section id="character" aria-label="Character" className="scroll-mt-32 pt-14 md:pt-20">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Who */}
        <motion.div className="lg:col-span-7" initial={false} animate={state}>
          <h1 aria-label={identity.handle} className="font-display font-bold uppercase leading-[0.82] tracking-tight">
            <motion.span
              aria-hidden
              data-text={handle}
              className={`nc-glitch text-[clamp(5rem,24vw,13rem)] text-foreground ${glitching ? 'is-glitching' : ''} nc-glitch-hover`}
              variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.15 } } }}
            >
              <span className="invisible">{handle}</span>
              <span className="absolute inset-0 whitespace-nowrap">{reduce ? handle : scrambled}</span>
            </motion.span>
          </h1>

          <motion.p className="mt-6 max-w-[38rem] font-display text-2xl font-medium leading-snug text-foreground md:text-[1.7rem]" variants={fade(0.25)}>
            {identity.lead}
          </motion.p>
          {identity.intro.map((p, i) => (
            <motion.p key={i} className="mt-4 max-w-[38rem] text-lg leading-relaxed text-muted-foreground" variants={fade(0.35 + i * 0.08)}>
              {p}
            </motion.p>
          ))}

          <motion.div className="mt-8 flex flex-wrap gap-3" variants={fade(0.55)}>
            <button onClick={() => scrollToSection('vibe')} className="nc-btn">
              Take the vibe check
            </button>
            <button onClick={() => scrollToSection('contact')} className="nc-btn nc-btn-ghost">
              Say hi
            </button>
          </motion.div>
        </motion.div>

        {/* Character sheet */}
        <motion.aside
          aria-label="Attributes"
          className="shard shard-lg lg:col-span-5 lg:mt-6"
          initial={false}
          animate={state}
          variants={{
            hidden: { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
            shown: {
              clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
              transition: { duration: 0.6, delay: 0.2, ease: EASE_IN_OUT },
            },
          }}
        >
          <div className="flex items-baseline justify-between px-6 pt-6">
            <h2 className="font-display text-lg font-bold uppercase tracking-widest">Attributes</h2>
            <span className="font-mono text-xs text-muted-foreground">max {MAX_ATTR}</span>
          </div>

          <ul className="mt-4 divide-y divide-primary/10">
            {attributes.map((a, row) => (
              <li key={a.key} className="px-6 py-3.5">
                <div className="flex items-center gap-4">
                  <span className="w-24 shrink-0 font-display text-base font-semibold uppercase tracking-wider sm:w-28">{a.key}</span>
                  <span className="w-7 shrink-0 font-display text-2xl font-bold tabular-nums text-[var(--nc-yellow)]">{a.value}</span>
                  <span className="flex min-w-0 flex-1 gap-[3px]" aria-hidden>
                    {Array.from({ length: MAX_ATTR }).map((_, i) =>
                      i < a.value ? (
                        <motion.span
                          key={i}
                          data-on="true"
                          className="nc-pip origin-bottom"
                          style={{ skewX: -18 }}
                          variants={{
                            hidden: { scaleY: 0 },
                            shown: { scaleY: 1, transition: { delay: 0.55 + row * 0.08 + i * 0.018, duration: 0.18, ease: EASE_OUT } },
                          }}
                        />
                      ) : (
                        <span key={i} className="nc-pip" />
                      ),
                    )}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{a.note}</p>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5 border-t border-primary/15 px-6 py-4 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--nc-cyan)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--nc-cyan)]" />
            </span>
            <span>
              It's <span className="font-display text-base font-semibold tabular-nums text-foreground">{time}</span> in {identity.city} right now.
            </span>
          </div>
        </motion.aside>
      </div>

      <ActiveJobs state={state} />
    </section>
  );
}

/** "Currently into", as the journal's active jobs. */
function ActiveJobs({ state }: { state: 'hidden' | 'shown' }) {
  const reading = now.reading && now.reading.toLowerCase() !== 'none' ? now.reading : null;
  const recommend = `mailto:${socials.email}?subject=${encodeURIComponent('A book you should read')}`;
  const jobs = [
    { icon: Headphones, label: 'On repeat', value: now.listening },
    { icon: Tv, label: 'Watching', value: now.watching },
    { icon: Gamepad2, label: 'Playing', value: now.playing },
    { icon: BookOpen, label: 'Reading', value: reading },
  ];

  return (
    <motion.div
      className="shard mt-12 md:mt-16"
      initial={false}
      animate={state}
      variants={{
        hidden: { opacity: 0, y: 12 },
        shown: { opacity: 1, y: 0, transition: { delay: 0.75, duration: 0.5, ease: EASE_OUT } },
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-[auto_repeat(4,minmax(0,1fr))]">
        <div className="col-span-2 flex items-center gap-2.5 border-b border-primary/15 px-5 py-3 md:col-span-1 md:border-b-0 md:border-r md:px-6">
          <span aria-hidden className="h-2.5 w-2.5 rotate-45 bg-[var(--nc-yellow)]" />
          <span className="font-display text-sm font-bold uppercase tracking-widest">Active jobs</span>
        </div>
        {jobs.map((j, i) => (
          <div
            key={j.label}
            className={`min-w-0 border-primary/15 px-5 py-4 md:px-6 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b md:border-b-0' : ''} md:border-r md:last:border-r-0`}
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <j.icon size={13} className="text-primary" /> {j.label}
            </div>
            {j.value ? (
              <div className="mt-1 font-display text-lg font-semibold leading-tight">{j.value}</div>
            ) : (
              <div className="mt-1 font-display text-lg font-semibold leading-tight text-muted-foreground">
                Nothing right now.{' '}
                <a href={recommend} className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
                  Recommend me one?
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
