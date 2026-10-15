"use client";

/** Decorative animated gradient orbs + grid. Purely visual, aria-hidden. */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern [background-size:60px_60px] opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute -left-32 top-10 h-[32rem] w-[32rem] rounded-full bg-violetx/20 blur-[120px] animate-orb-drift" />
      <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-indigox/20 blur-[120px] animate-orb-drift [animation-delay:-7s]" />
      <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-cyanx/10 blur-[120px] animate-orb-drift [animation-delay:-14s]" />
    </div>
  );
}
