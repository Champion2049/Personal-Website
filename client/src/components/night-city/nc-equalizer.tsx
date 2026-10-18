import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getGridAnalyser, gridAudioElement, isMuted, playGridTrack, toggleMute } from '@/lib/grid-audio';

const BARS = 48;
const FRAME_MS = 1000 / 30;

/**
 * Chids FM's on-air strip: a neon equalizer driven by the music actually
 * playing on this page (the Night City soundtrack), read through a Web Audio
 * analyser. It only animates while the track plays and the strip is on screen;
 * otherwise it rests as a low skyline of bars. 30fps, small canvas.
 */
export function NCEqualizer() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(isMuted());

  useEffect(() => {
    const onMute = (e: Event) => setMuted((e as CustomEvent).detail.muted);
    window.addEventListener('grid-audio-mute', onMute);
    return () => window.removeEventListener('grid-audio-mute', onMute);
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const peaks = new Float32Array(BARS);
    let bins: Uint8Array | null = null;
    // log-spaced bin edges, so bass doesn't hog the strip
    const edges = Array.from({ length: BARS + 1 }, (_, i) => Math.round(1 + Math.pow(i / BARS, 1.7) * 90));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      draw(null);
    };

    const draw = (an: AnalyserNode | null) => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      if (an) {
        if (!bins || bins.length !== an.frequencyBinCount) bins = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(bins);
      }
      const base = h * 0.78; // bars stand on this line; the rest is their reflection
      const gap = 3;
      const bw = (w - gap * (BARS - 1)) / BARS;
      const grad = g.createLinearGradient(0, base, 0, 0);
      grad.addColorStop(0, 'hsl(2 100% 58%)');
      grad.addColorStop(0.65, 'hsl(14 100% 58%)');
      grad.addColorStop(1, 'hsl(56 100% 55%)');
      for (let i = 0; i < BARS; i++) {
        let v: number;
        if (bins) {
          let sum = 0;
          const a = edges[i];
          const b = Math.max(a + 1, edges[i + 1]);
          for (let k = a; k < b; k++) sum += bins[k];
          v = Math.pow(sum / (b - a) / 255, 1.6); // a contrast curve, so peaks stand out from the bed
        } else {
          v = 0.06 + 0.05 * Math.abs(Math.sin(i * 1.7)); // resting skyline
        }
        const bh = Math.max(2, v * base * 0.95);
        const x = i * (bw + gap);
        peaks[i] = Math.max(peaks[i] - 0.012, v);
        g.globalAlpha = 1;
        g.fillStyle = grad;
        g.fillRect(x, base - bh, bw, bh);
        // reflection on the wet floor
        g.globalAlpha = 0.18;
        g.fillRect(x, base + 2, bw, bh * 0.28);
        // falling peak cap
        g.globalAlpha = 0.9;
        g.fillStyle = 'hsl(56 100% 60%)';
        g.fillRect(x, base - Math.max(2, peaks[i] * base * 0.95) - 4, bw, 2);
      }
      g.globalAlpha = 1;
    };

    let raf = 0;
    let last = 0;
    let visible = false;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < FRAME_MS) return;
      last = t;
      draw(getGridAnalyser());
    };
    const sync = () => {
      const el = gridAudioElement();
      const on = !!el && !el.paused && !isMuted();
      setPlaying(on);
      if (on && visible && !reduce) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
        draw(null);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(c);
    // the audio element is created lazily; poll briefly for it, then follow its play/pause events
    let el = gridAudioElement();
    const attach = () => {
      el?.addEventListener('play', sync);
      el?.addEventListener('pause', sync);
    };
    const poll = setInterval(() => {
      if (!el && (el = gridAudioElement())) attach();
      sync();
    }, 1000);
    attach();
    window.addEventListener('grid-audio-mute', sync);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(poll);
      ro.disconnect();
      io.disconnect();
      el?.removeEventListener('play', sync);
      el?.removeEventListener('pause', sync);
      window.removeEventListener('grid-audio-mute', sync);
    };
  }, []);

  const onToggle = () => {
    if (muted) toggleMute();
    else if (!playing) playGridTrack();
    else toggleMute();
  };

  return (
    <div className="shard shard-lg mb-4 p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${playing ? 'bg-primary shadow-[0_0_10px_hsl(2_100%_60%)] animate-pulse' : 'bg-primary/40'}`} />
          <span className="font-display text-xl font-bold uppercase tracking-widest">Chids FM</span>
          <span className="text-sm text-muted-foreground">{playing ? 'On air' : 'Off air'}</span>
        </div>
        <button onClick={onToggle} className="nc-btn nc-btn-ghost" aria-label={playing ? 'Mute the soundtrack' : 'Play the soundtrack'}>
          {playing ? <VolumeX size={16} /> : <Volume2 size={16} />} {playing ? 'Mute' : 'Tune in'}
        </button>
      </div>
      <canvas ref={canvas} aria-hidden className="mt-5 block h-32 w-full md:h-40" />
      <p className="mt-2 text-sm text-muted-foreground">
        Reacting live to this page's soundtrack: <span className="text-foreground">End of Line</span> by Daft Punk.
      </p>
    </div>
  );
}
