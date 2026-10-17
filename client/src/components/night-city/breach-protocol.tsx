import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Check, X } from 'lucide-react';
import { shards } from '@/lib/personal-data';

/**
 * Breach Protocol, the netrunning minigame from Cyberpunk 2077.
 * Pick codes into the buffer: first from the top row, then alternate between
 * the column and the row of your last pick. Upload a daemon by getting its
 * sequence into the buffer in order. Each daemon unlocks one shard.
 *
 * Puzzles are generated from a real path through the matrix, so every
 * daemon is always solvable in a single run.
 */
const CODES = ['1C', '55', 'BD', 'E9', '7A', 'FF'];
const SIZE = 5;
const BUFFER = 7;
const TIME_LIMIT = 45; // seconds, starts on the first pick

type Pos = { r: number; c: number };
type Axis = { kind: 'row' | 'col'; index: number };
interface Puzzle { grid: string[][]; daemons: string[][] }

const rand = (n: number) => Math.floor(Math.random() * n);

function makePuzzle(): Puzzle {
  for (;;) {
    const grid = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => CODES[rand(CODES.length)]));
    const used = new Set<string>();
    const path: Pos[] = [];
    let axis: Axis = { kind: 'row', index: 0 };
    for (let step = 0; step < 6; step++) {
      const options: Pos[] = [];
      for (let i = 0; i < SIZE; i++) {
        const p = axis.kind === 'row' ? { r: axis.index, c: i } : { r: i, c: axis.index };
        if (!used.has(`${p.r},${p.c}`)) options.push(p);
      }
      const p = options[rand(options.length)];
      used.add(`${p.r},${p.c}`);
      path.push(p);
      axis = axis.kind === 'row' ? { kind: 'col', index: p.c } : { kind: 'row', index: p.r };
    }
    const s = path.map((p) => grid[p.r][p.c]);
    const daemons = [s.slice(0, 2), s.slice(1, 4), s.slice(3, 6)];
    const keys = daemons.map((d) => d.join(' '));
    if (new Set(keys).size === keys.length) return { grid, daemons };
  }
}

const contains = (buf: string[], seq: string[]) => {
  for (let i = 0; i + seq.length <= buf.length; i++) if (seq.every((c, j) => buf[i + j] === c)) return true;
  return false;
};
/** How much of `seq` the tail of the buffer already matches. */
const progressOf = (buf: string[], seq: string[]) => {
  for (let k = Math.min(seq.length - 1, buf.length); k > 0; k--) {
    if (seq.slice(0, k).every((c, j) => buf[buf.length - k + j] === c)) return k;
  }
  return 0;
};

export function BreachProtocol() {
  const reduce = useReducedMotion();
  const [puzzle, setPuzzle] = useState<Puzzle>(makePuzzle);
  const [picked, setPicked] = useState<Pos[]>([]);
  const [hover, setHover] = useState<Pos | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [left, setLeft] = useState(TIME_LIMIT);
  const [timedOut, setTimedOut] = useState(false);
  const raf = useRef(0);

  const buffer = picked.map((p) => puzzle.grid[p.r][p.c]);
  const last = picked[picked.length - 1];
  const axis: Axis = !last ? { kind: 'row', index: 0 } : picked.length % 2 === 1 ? { kind: 'col', index: last.c } : { kind: 'row', index: last.r };
  const isUsed = (r: number, c: number) => picked.some((p) => p.r === r && p.c === c);
  const onAxis = (r: number, c: number) => (axis.kind === 'row' ? r === axis.index : c === axis.index);

  const status = useMemo(
    () =>
      puzzle.daemons.map((d) => {
        if (contains(buffer, d)) return { state: 'done' as const, progress: d.length };
        const progress = progressOf(buffer, d);
        if (BUFFER - buffer.length < d.length - progress) return { state: 'failed' as const, progress: 0 };
        return { state: 'open' as const, progress };
      }),
    [buffer.join(' '), puzzle],
  );
  const uploaded = status.filter((s) => s.state === 'done').length;
  const settled = status.every((s) => s.state !== 'open');
  const over = settled || buffer.length >= BUFFER || timedOut;

  // Breach timer
  useEffect(() => {
    if (startedAt == null || over) return;
    const tick = () => {
      const remaining = Math.max(0, TIME_LIMIT - (performance.now() - startedAt) / 1000);
      setLeft(remaining);
      if (remaining <= 0) setTimedOut(true);
      else raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [startedAt, over]);

  const choose = (r: number, c: number) => {
    if (over || isUsed(r, c) || !onAxis(r, c)) return;
    if (startedAt == null) setStartedAt(performance.now());
    setPicked((p) => [...p, { r, c }]);
    setHover(null);
  };

  const reset = useCallback(() => {
    setPuzzle(makePuzzle());
    setPicked([]);
    setHover(null);
    setStartedAt(null);
    setLeft(TIME_LIMIT);
    setTimedOut(false);
  }, []);

  const preview = hover && !over && onAxis(hover.r, hover.c) && !isUsed(hover.r, hover.c) ? puzzle.grid[hover.r][hover.c] : null;
  const timePct = (left / TIME_LIMIT) * 100;

  return (
    <div className="font-mono text-[hsl(64_85%_66%)]">
      {/* Timer + buffer */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.2em] text-[hsl(64_40%_55%)]">Breach time remaining</div>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-display text-3xl font-bold tabular-nums">{left.toFixed(2)}</span>
            <span className="h-1.5 w-28 bg-[hsl(64_40%_20%)]">
              <span className="block h-full bg-[hsl(64_85%_66%)] transition-[width] duration-100" style={{ width: `${timePct}%` }} />
            </span>
          </div>
        </div>
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.2em] text-[hsl(64_40%_55%)]">Buffer</div>
          <ol className="mt-1.5 flex gap-1" aria-label={`Buffer: ${buffer.join(' ') || 'empty'}`}>
            {Array.from({ length: BUFFER }).map((_, i) => {
              const code = buffer[i] ?? (i === buffer.length ? preview : null);
              const ghost = i === buffer.length && !!preview;
              return (
                <li
                  key={i}
                  className={`grid h-8 w-8 place-items-center border text-sm ${
                    buffer[i] ? 'border-[hsl(64_85%_66%/0.8)]' : 'border-dashed border-[hsl(64_40%_35%)]'
                  } ${ghost ? 'text-[hsl(64_40%_55%)]' : ''}`}
                >
                  {code}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        {/* Code matrix */}
        <div className="relative w-fit border border-[hsl(64_40%_30%)] p-2" role="grid" aria-label="Code matrix">
          {/* Active row/column band */}
          {!over && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute bg-[hsl(185_100%_50%/0.1)] ring-1 ring-[hsl(185_100%_50%/0.35)]"
              initial={false}
              animate={
                axis.kind === 'row'
                  ? { top: 8 + axis.index * 48, left: 8, width: SIZE * 48 - 4, height: 44 }
                  : { top: 8, left: 8 + axis.index * 48, width: 44, height: SIZE * 48 - 4 }
              }
              transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.3, bounce: 0 }}
            />
          )}
          {puzzle.grid.map((row, r) => (
            <div key={r} role="row" className="flex gap-1 [&:not(:first-child)]:mt-1">
              {row.map((code, c) => {
                const used = isUsed(r, c);
                const active = !over && !used && onAxis(r, c);
                return (
                  <button
                    key={c}
                    role="gridcell"
                    disabled={!active}
                    onClick={() => choose(r, c)}
                    onPointerEnter={() => setHover({ r, c })}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover({ r, c })}
                    onBlur={() => setHover(null)}
                    aria-label={used ? 'Used' : code}
                    className={`relative grid h-11 w-11 place-items-center text-base transition-colors duration-150 ${
                      used
                        ? 'text-[hsl(64_30%_30%)]'
                        : active
                          ? 'cursor-pointer text-[hsl(64_85%_70%)] hover:bg-[hsl(185_100%_50%/0.2)] hover:text-[var(--nc-cyan)] focus-visible:bg-[hsl(185_100%_50%/0.2)] focus-visible:text-[var(--nc-cyan)] focus-visible:outline-none'
                          : 'text-[hsl(64_50%_45%)]'
                    }`}
                  >
                    {used ? '[ ]' : code}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Daemons */}
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.2em] text-[hsl(64_40%_55%)]">Sequences required to upload</div>
          <ul className="mt-2 space-y-2">
            {puzzle.daemons.map((d, i) => {
              const s = status[i];
              return (
                <li
                  key={i}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 border px-3 py-2 transition-colors duration-200 ${
                    s.state === 'done'
                      ? 'border-[hsl(140_70%_50%/0.6)] bg-[hsl(140_70%_50%/0.08)]'
                      : s.state === 'failed'
                        ? 'border-[hsl(2_100%_60%/0.5)] bg-[hsl(2_100%_60%/0.06)] opacity-70'
                        : 'border-[hsl(64_40%_30%)]'
                  }`}
                >
                  <span className="flex gap-1.5 text-sm">
                    {d.map((code, j) => (
                      <span
                        key={j}
                        className={
                          s.state === 'done' ? 'text-[hsl(140_70%_60%)]' : j < s.progress ? 'text-[var(--nc-cyan)]' : preview && j === s.progress && preview === code ? 'text-[var(--nc-cyan)]/70 underline' : ''
                        }
                      >
                        {code}
                      </span>
                    ))}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs tracking-wider text-[hsl(64_40%_60%)]">
                    {s.state === 'done' && <Check size={13} className="text-[hsl(140_70%_60%)]" />}
                    {s.state === 'failed' && <X size={13} className="text-primary" />}
                    {shards[i]?.daemon ?? `DAEMON_${i + 1}`}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 font-sans text-xs leading-relaxed text-[hsl(64_25%_55%)]">
            Start in the top row. After that, alternate: pick from the column of your last code, then its row.
          </p>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {over && (
          <motion.div
            className="mt-6 border-t border-[hsl(64_40%_30%)] pt-5 font-sans"
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`font-display text-2xl font-bold uppercase tracking-wider ${uploaded ? 'text-[hsl(140_70%_60%)]' : 'text-primary'}`}>
                {uploaded === puzzle.daemons.length
                  ? 'Breach successful'
                  : uploaded
                    ? `${uploaded} of ${puzzle.daemons.length} daemons uploaded`
                    : timedOut
                      ? 'Breach timed out'
                      : 'Breach failed'}
              </p>
              <button onClick={reset} className="nc-btn nc-btn-ghost py-2 text-sm">
                <RotateCcw size={14} /> New breach
              </button>
            </div>
            {uploaded > 0 && (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {status.map((s, i) =>
                  s.state === 'done' && shards[i] ? (
                    <motion.li
                      key={i}
                      className="shard shard-sm p-4"
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.25 }}
                    >
                      <div className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--nc-cyan)]">Shard unlocked</div>
                      <div className="mt-1 font-display text-lg font-bold text-foreground">{shards[i].title}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{shards[i].body}</p>
                    </motion.li>
                  ) : null,
                )}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
