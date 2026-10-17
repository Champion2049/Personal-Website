import { useMemo } from 'react';

/**
 * Decorative barcode generated from a string, so the same label always gets
 * the same bars (the spec-sheet references stamp barcodes on everything).
 */
export function Barcode({ value, className = '', height = 32 }: { value: string; className?: string; height?: number }) {
  const { bars, width } = useMemo(() => {
    let h = 2166136261;
    let x = 0;
    const out: { x: number; w: number }[] = [];
    for (const ch of `${value}::${value.length}`) {
      h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
      for (let k = 0; k < 2; k++) {
        const w = 1 + ((h >>> (k * 4)) % 3);
        const gap = 1 + ((h >>> (k * 4 + 2)) % 2);
        out.push({ x, w });
        x += w + gap;
      }
    }
    return { bars: out, width: x };
  }, [value]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="currentColor" />
      ))}
    </svg>
  );
}
