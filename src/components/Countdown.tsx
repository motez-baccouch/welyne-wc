"use client";

import { useEffect, useState } from "react";
import { Lang, tr } from "@/lib/i18n";

/** Next daily results sync = 12:00 UTC (matches the Vercel cron schedule). */
function msUntilNextNoonUTC(now: Date) {
  const next = new Date(now);
  next.setUTCHours(12, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - now.getTime();
}

function fmt(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return { h, m, s };
}

export default function Countdown({ lang = "en" }: { lang?: Lang }) {
  const t = (k: string) => tr(lang, k);
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(msUntilNextNoonUTC(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const parts = ms == null ? null : fmt(ms);

  return (
    <div className="countdown">
      <div className="cd-head">
        <span className="cd-dot" />
        <span className="cd-title">{t("cd.title")}</span>
      </div>
      <div className="cd-clock" suppressHydrationWarning>
        {parts ? (
          <>
            <span className="cd-num">{parts.h}</span>
            <span className="cd-sep">:</span>
            <span className="cd-num">{parts.m}</span>
            <span className="cd-sep">:</span>
            <span className="cd-num">{parts.s}</span>
          </>
        ) : (
          <span className="cd-num">--:--:--</span>
        )}
      </div>
      <div className="cd-sub">{t("cd.sub")}</div>
    </div>
  );
}
