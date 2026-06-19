import React from "react";

// GridGlow background: animated grid + radial glow aligned to brand oranges
export function GridGlowBackground({ className = "" }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 " + className}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,140,80,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,80,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px, 60px 60px",
          maskImage:
            "radial-gradient(ellipse at 50% 35%, black 0%, black 50%, transparent 80%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 40% at 65% 30%, rgba(255,100,50,0.25), transparent 70%), radial-gradient(35% 35% at 30% 70%, rgba(255,180,100,0.18), transparent 70%)",
          filter: "blur(40px)",
          mixBlendMode: "screen",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

export default GridGlowBackground;
