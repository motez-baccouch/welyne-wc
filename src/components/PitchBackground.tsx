"use client";

import { useEffect, useRef } from "react";

export default function PitchBackground() {
  const stripes = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (stripes.current) stripes.current.style.transform = `translate3d(0,${y * 0.06}px,0)`;
        if (lines.current) lines.current.style.transform = `translate3d(0,${y * 0.14}px,0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pitch-bg" aria-hidden="true">
      <div className="pitch-stripes" ref={stripes} />
      <div className="pitch-lines" ref={lines}>
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {/* outer boundary */}
          <rect className="pl" x="40" y="40" width="1120" height="720" rx="6" />
          {/* halfway line */}
          <line className="pl" x1="600" y1="40" x2="600" y2="760" />
          {/* centre circle + spot */}
          <circle className="pl" cx="600" cy="400" r="95" />
          <circle className="pl-fill" cx="600" cy="400" r="5" />
          {/* left penalty + goal area */}
          <rect className="pl" x="40" y="250" width="165" height="300" />
          <rect className="pl" x="40" y="325" width="65" height="150" />
          <circle className="pl-fill" cx="160" cy="400" r="4" />
          <path className="pl" d="M205 320 A 95 95 0 0 1 205 480" />
          {/* right penalty + goal area */}
          <rect className="pl" x="995" y="250" width="165" height="300" />
          <rect className="pl" x="1095" y="325" width="65" height="150" />
          <circle className="pl-fill" cx="1040" cy="400" r="4" />
          <path className="pl" d="M995 320 A 95 95 0 0 0 995 480" />
        </svg>
      </div>
    </div>
  );
}
