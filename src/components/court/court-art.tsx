import { cn } from "@/lib/utils";

/**
 * Stylized top-down pickleball court illustration used as a court header when
 * no photo is available. Pure inline SVG — no external images or licensing.
 * The surface color is derived from a seed so each court looks distinct.
 */
const PALETTES = [
  { surround: "#12603f", court: "#1f9d63", ball: "#eef264" }, // green
  { surround: "#1e3a8a", court: "#3b74e0", ball: "#eef264" }, // blue
  { surround: "#0f5f57", court: "#17a89a", ball: "#f6f77a" }, // teal
  { surround: "#5b2aa8", court: "#8257e6", ball: "#f2f471" }, // purple
  { surround: "#9a3d12", court: "#e2701f", ball: "#f4f36f" }, // clay
  { surround: "#0e5a72", court: "#1594c4", ball: "#f0f36e" }, // sky
];

function seedIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function CourtArt({ seed, className }: { seed: string; className?: string }) {
  const p = PALETTES[seedIndex(seed, PALETTES.length)]!;
  const line = "rgba(255,255,255,0.9)";
  const sw = 2;

  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Pickleball court illustration"
    >
      {/* apron / surround */}
      <rect width="400" height="200" fill={p.surround} />
      {/* subtle depth */}
      <rect width="400" height="200" fill="url(#court-shade)" />
      <defs>
        <linearGradient id="court-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
      </defs>

      {/* playing surface */}
      <rect x="34" y="30" width="332" height="140" rx="4" fill={p.court} />
      {/* boundary */}
      <rect x="34" y="30" width="332" height="140" rx="4" fill="none" stroke={line} strokeWidth={sw} />

      {/* non-volley zone (kitchen) lines, 7ft each side of net */}
      <line x1="160" y1="30" x2="160" y2="170" stroke={line} strokeWidth={sw} />
      <line x1="240" y1="30" x2="240" y2="170" stroke={line} strokeWidth={sw} />

      {/* centerline through the service courts (not across the kitchen) */}
      <line x1="34" y1="100" x2="160" y2="100" stroke={line} strokeWidth={sw} />
      <line x1="240" y1="100" x2="366" y2="100" stroke={line} strokeWidth={sw} />

      {/* net */}
      <line x1="200" y1="24" x2="200" y2="176" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeDasharray="3 3" />
      <circle cx="200" cy="24" r="3.5" fill={line} />
      <circle cx="200" cy="176" r="3.5" fill={line} />

      {/* pickleball */}
      <g transform="translate(322,140)">
        <circle r="12" fill={p.ball} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        <circle cx="-4" cy="-3" r="1.6" fill="rgba(0,0,0,0.28)" />
        <circle cx="3" cy="-4" r="1.6" fill="rgba(0,0,0,0.28)" />
        <circle cx="5" cy="2" r="1.6" fill="rgba(0,0,0,0.28)" />
        <circle cx="-2" cy="4" r="1.6" fill="rgba(0,0,0,0.28)" />
        <circle cx="-6" cy="1" r="1.6" fill="rgba(0,0,0,0.28)" />
      </g>
    </svg>
  );
}
