/**
 * Iconic TRON perspective grid floor: a neon lattice receding to a glowing
 * horizon, scrolling slowly toward the viewer. Pure CSS, GPU-friendly.
 */
export function TronGrid({ color = '#22d3ee', className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* ambient horizon glow */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '34%',
          height: 220,
          transform: 'translateY(-55%)',
          background: `radial-gradient(60% 80% at 50% 100%, ${color}33, transparent 70%)`,
        }}
      />
      {/* horizon line */}
      <div
        className="absolute left-0 right-0"
        style={{ top: '34%', height: 1, background: color, opacity: 0.6, boxShadow: `0 0 26px 4px ${color}` }}
      />
      {/* floor */}
      <div className="absolute left-0 right-0 bottom-0" style={{ top: '34%', perspective: '260px', perspectiveOrigin: '50% 0%' }}>
        <div
          className="absolute"
          style={{
            inset: '0 -60% -20% -60%',
            transform: 'rotateX(76deg)',
            transformOrigin: '50% 0%',
            backgroundImage: `linear-gradient(to right, ${color}55 1px, transparent 1px), linear-gradient(to bottom, ${color}55 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-rush 3.6s linear infinite',
            maskImage: 'linear-gradient(to bottom, transparent, black 22%, black 75%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 22%, black 75%, transparent)',
          }}
        />
      </div>
    </div>
  );
}
