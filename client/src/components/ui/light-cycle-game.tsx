import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TRON light-cycle. You ARE the bike — the head is your cycle and the glowing
 * wall behind you is your light trail. Arrow keys / WASD on desktop; swipe or
 * the on-screen D-pad on touch devices.
 */
const CELL = 18;
const COLS = 28;
const ROWS = 16;
const BASE_SPEED = 95;

type P = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';
type Status = 'idle' | 'count' | 'play' | 'over';

const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const VEC: Record<Dir, P> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

const TRAIL = '#ff3a2e';
const HEAD = '#ffe6e0';
const FOOD = '#ffc24d';
const GRID = 'rgba(255, 70, 55, 0.12)';
const BG = '#120504';

export function LightCycleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [count, setCount] = useState(3);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isTouch, setIsTouch] = useState(false);

  const snake = useRef<P[]>([{ x: 5, y: 8 }]);
  const dir = useRef<Dir>('right');
  const queued = useRef<Dir | null>(null);
  const food = useRef<P>({ x: 18, y: 8 });
  const loop = useRef<number | null>(null);
  const statusRef = useRef<Status>('idle');
  statusRef.current = status;

  useEffect(() => {
    setIsTouch(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }, []);

  const steer = (d: Dir) => { queued.current = d; };

  const placeFood = () => {
    let p: P;
    do {
      p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.current.some((s) => s.x === p.x && s.y === p.y));
    food.current = p;
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    try {
    const W = COLS * CELL, H = ROWS * CELL;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }

    const f = food.current;
    ctx.fillStyle = FOOD; ctx.shadowColor = FOOD; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2); ctx.fill();

    const body = snake.current;
    const cx = (i: number) => body[i].x * CELL + CELL / 2;
    const cy = (i: number) => body[i].y * CELL + CELL / 2;
    if (body.length > 1) {
      ctx.shadowColor = TRAIL; ctx.shadowBlur = 14; ctx.strokeStyle = TRAIL;
      ctx.lineWidth = CELL - 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx(body.length - 1), cy(body.length - 1));
      for (let i = body.length - 2; i >= 0; i--) ctx.lineTo(cx(i), cy(i));
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,180,200,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    }

    const hx = cx(0), hy = cy(0);
    const v = VEC[dir.current];
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(v.y, v.x));
    ctx.shadowColor = HEAD; ctx.shadowBlur = 18; ctx.fillStyle = HEAD;
    const r = CELL / 2;
    ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r * 0.7, r * 0.7); ctx.lineTo(-r * 0.3, 0); ctx.lineTo(-r * 0.7, -r * 0.7); ctx.closePath(); ctx.fill();
    ctx.restore(); ctx.shadowBlur = 0;
    } catch { /* never let a draw glitch crash the page */ }
  }, []);

  const tick = useCallback(() => {
    if (queued.current && queued.current !== OPP[dir.current]) dir.current = queued.current;
    const v = VEC[dir.current];
    const head = snake.current[0];
    const next: P = { x: head.x + v.x, y: head.y + v.y };
    if (next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS ||
        snake.current.some((s) => s.x === next.x && s.y === next.y)) {
      setStatus('over');
      setBest((b) => Math.max(b, snake.current.length - 1));
      return;
    }
    snake.current = [next, ...snake.current];
    if (next.x === food.current.x && next.y === food.current.y) { setScore((s) => s + 1); placeFood(); }
    else snake.current.pop();
    draw();
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (status !== 'play') { if (loop.current) window.clearInterval(loop.current); return; }
    const speed = Math.max(55, BASE_SPEED - score * 2);
    loop.current = window.setInterval(tick, speed);
    return () => { if (loop.current) window.clearInterval(loop.current); };
  }, [status, tick, score]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
      };
      const dd = map[e.key];
      if (dd) { if (statusRef.current === 'play') e.preventDefault(); steer(dd); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // touch swipe (non-passive so we can prevent page scroll while playing)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let sx = 0, sy = 0;
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const onMove = (e: TouchEvent) => { if (statusRef.current === 'play') e.preventDefault(); };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 'right' : 'left');
      else steer(dy > 0 ? 'down' : 'up');
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, []);

  useEffect(() => {
    if (status !== 'count') return;
    if (count <= 0) { setStatus('play'); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 650);
    return () => clearTimeout(t);
  }, [status, count]);

  const begin = () => {
    snake.current = [{ x: 5, y: 8 }];
    dir.current = 'right';
    queued.current = null;
    setScore(0); placeFood(); draw(); setCount(3); setStatus('count');
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-3 font-mono text-xs">
        <span className="text-muted-foreground">SCORE <span className="text-primary">{String(score).padStart(3, '0')}</span></span>
        <span className="hidden sm:inline text-muted-foreground tracking-widest">⬡ GRID COMBAT</span>
        <span className="text-muted-foreground">BEST <span className="text-primary">{String(best).padStart(3, '0')}</span></span>
      </div>

      <div ref={wrapRef} className="relative w-full max-w-[504px] rounded-xl overflow-hidden border border-primary/30"
        style={{ boxShadow: '0 0 34px hsl(2 100% 55% / 0.2)' }}>
        <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="block w-full h-auto" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'repeating-linear-gradient(transparent 0 3px, rgba(0,0,0,0.18) 3px 4px)' }} />

        {status === 'idle' && (
          <div className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-[2px] px-4">
            <div className="text-center">
              <p className="font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.4em] text-primary/70 mb-2">CHIRAYU SYSTEMS // ARCADE</p>
              <h3 className="font-tron text-2xl sm:text-4xl font-bold neon-text leading-none">LIGHT&#8209;CYCLE</h3>
              <p className="mt-2 font-mono text-[0.7rem] sm:text-xs text-muted-foreground">enter the grid · survive · derez your rivals</p>
              <button onClick={begin} className="mt-5 rounded-full bg-primary px-7 py-3 font-tron font-bold tracking-wider text-primary-foreground transition-transform hover:scale-105 animate-pulse-glow">
                ▶ PRESS START
              </button>
              <p className="mt-3 font-mono text-[0.7rem] text-muted-foreground animate-pulse">
                {isTouch ? 'swipe or use the pad to steer' : '◄ ► ▲ ▼ / WASD to steer'}
              </p>
            </div>
          </div>
        )}

        {status === 'count' && (
          <div className="absolute inset-0 grid place-items-center bg-black/55">
            <span key={count} className="font-tron text-6xl sm:text-7xl font-black neon-text animate-glitch">{count === 0 ? 'GO' : count}</span>
          </div>
        )}

        {status === 'over' && (
          <div className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-[2px] px-4">
            <div className="text-center">
              <p className="font-tron text-2xl sm:text-4xl font-bold neon-text animate-glitch">DERESOLVED</p>
              <p className="mt-2 text-sm text-muted-foreground">{score} node{score === 1 ? '' : 's'} collected{score >= best && score > 0 ? ' · NEW BEST' : ''}.</p>
              <button onClick={begin} className="mt-4 rounded-full bg-primary px-7 py-2.5 font-tron font-bold tracking-wider text-primary-foreground transition-transform hover:scale-105 animate-pulse-glow">
                ↻ RUN AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch D-pad */}
      {isTouch && (
        <div className="mt-5 grid grid-cols-3 grid-rows-3 gap-2 w-44 select-none" style={{ touchAction: 'none' }}>
          <span />
          <DpadBtn onPress={() => steer('up')}><ChevronUp size={22} /></DpadBtn>
          <span />
          <DpadBtn onPress={() => steer('left')}><ChevronLeft size={22} /></DpadBtn>
          <span />
          <DpadBtn onPress={() => steer('right')}><ChevronRight size={22} /></DpadBtn>
          <span />
          <DpadBtn onPress={() => steer('down')}><ChevronDown size={22} /></DpadBtn>
          <span />
        </div>
      )}
    </div>
  );
}

function DpadBtn({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
      onClick={onPress}
      className="grid place-items-center h-12 rounded-xl border border-primary/40 bg-primary/10 text-primary active:bg-primary/30"
      style={{ touchAction: 'none' }}
    >
      {children}
    </button>
  );
}
