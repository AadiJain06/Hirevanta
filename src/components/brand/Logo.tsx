import { cn } from "@/lib/utils";

/** HireVanta wordmark + custom minimal "V/node" symbol. */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8" />
      {showText && (
        <span className="text-xl font-extrabold tracking-tight text-white">
          Hire<span className="gradient-text">Vanta</span>
        </span>
      )}
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      role="img"
      aria-label="HireVanta logo"
    >
      <defs>
        <linearGradient id="hv-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="11"
        stroke="url(#hv-grad)"
        strokeWidth="2"
      />
      {/* Connected-node "V" — talent network motif */}
      <path
        d="M11 12 L20 28 L29 12"
        stroke="url(#hv-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="12" r="3" fill="#a78bfa" />
      <circle cx="29" cy="12" r="3" fill="#22d3ee" />
      <circle cx="20" cy="28" r="3" fill="#4f46e5" />
    </svg>
  );
}
