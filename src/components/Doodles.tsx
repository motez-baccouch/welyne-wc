/* Hand-drawn-style line-art SVGs in the Welyne orange aesthetic. */

export function BallDoodle({ size = 120 }: { size?: number }) {
  return (
    <svg
      className="doodle"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Soccer ball"
      fill="none"
    >
      <circle cx="60" cy="60" r="46" stroke="var(--orange)" strokeWidth="3" />
      {/* central pentagon */}
      <path
        d="M60 38 L77 50 L70 70 L50 70 L43 50 Z"
        fill="var(--orange)"
        fillOpacity="0.18"
        stroke="var(--orange)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* spokes to the rim */}
      <path d="M60 38 L60 16" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M77 50 L98 44" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M70 70 L86 88" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M50 70 L34 88" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M43 50 L22 44" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
      {/* motion ticks */}
      <path className="doodle-spin" d="M14 60 q-9 2 -9 0" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
      <circle className="doodle-blink" cx="104" cy="78" r="2.6" fill="var(--orange)" />
    </svg>
  );
}

export function TrophyDoodle({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Trophy" fill="none">
      <path
        d="M32 22 H68 V40 a18 18 0 0 1 -36 0 Z"
        fill="var(--orange)"
        fillOpacity="0.16"
        stroke="var(--orange)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M32 26 H20 a8 8 0 0 0 12 12" stroke="var(--orange)" strokeWidth="3" strokeLinecap="round" />
      <path d="M68 26 H80 a8 8 0 0 1 -12 12" stroke="var(--orange)" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 58 V70" stroke="var(--orange)" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 78 H62" stroke="var(--orange)" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 70 H56 V78 H44 Z" stroke="var(--orange)" strokeWidth="3" strokeLinejoin="round" />
      <path className="doodle-blink" d="M50 30 l2.2 4.6 5 .6 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.6 Z" fill="var(--orange)" />
    </svg>
  );
}

export function PitchDoodle() {
  return (
    <svg className="doodle" viewBox="0 0 320 120" role="img" aria-label="Pitch" fill="none" width="100%">
      <rect x="3" y="3" width="314" height="114" rx="8" stroke="var(--line)" strokeWidth="2" />
      <path d="M160 3 V117" stroke="var(--line)" strokeWidth="2" />
      <circle cx="160" cy="60" r="22" stroke="var(--line)" strokeWidth="2" />
      <circle cx="160" cy="60" r="3" fill="var(--orange)" />
      <rect x="3" y="34" width="34" height="52" stroke="var(--line)" strokeWidth="2" />
      <rect x="283" y="34" width="34" height="52" stroke="var(--line)" strokeWidth="2" />
      <path className="doodle-spin" d="M250 30 q14 -10 24 4" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="246" cy="32" r="5" stroke="var(--orange)" strokeWidth="2.4" />
    </svg>
  );
}
