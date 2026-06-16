"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lang, tr } from "@/lib/i18n";
import { championReactionKey } from "@/lib/champion";
import Flag from "./Flag";

type Team = { id: number; code: string; name: string; flag: string; odds: number | null };

export default function ChampionSelect({
  teams,
  current,
  changesLeft,
  locked,
  lang,
}: {
  teams: Team[];
  current: number | null;
  changesLeft: number;
  locked: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v);

  const sorted = useMemo(() => [...teams].sort((a, b) => (a.odds ?? 9999) - (b.odds ?? 9999)), [teams]);

  const [championId, setChampionId] = useState<number | null>(current);
  const [selected, setSelected] = useState<number | null>(null); // pending tap
  const [left, setLeft] = useState(changesLeft);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const champion = teams.find((x) => x.id === championId) ?? null;
  const pending = teams.find((x) => x.id === selected) ?? null;
  const canChange = !locked && left > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? sorted.filter((x) => x.name.toLowerCase().includes(q)) : sorted;
  }, [sorted, query]);

  async function confirm() {
    if (selected == null || busy) return;
    setErr("");
    setBusy(true);
    const res = await fetch("/api/champion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: selected }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setChampionId(selected);
      setSelected(null);
      if (typeof data.changesLeft === "number") setLeft(data.changesLeft);
      setJustSaved(true);
      router.refresh();
    } else {
      setErr(data.error ?? "Failed");
    }
  }

  // ── locked / read-only ──
  if (locked) {
    return (
      <div className="cs-success">
        <div className="cs-success-flag">
          <Flag code={champion?.code} emoji={champion?.flag} w={56} />
        </div>
        <div className="cs-success-name">{champion?.name ?? "—"}</div>
        <span className="pill locked">{t("champ.locked")}</span>
      </div>
    );
  }

  return (
    <div className="cs-wrap">
      {/* current champion banner */}
      {champion && (
        <div className={`cs-current ${justSaved ? "pop" : ""}`}>
          <Flag code={champion.code} emoji={champion.flag} w={44} />
          <div style={{ minWidth: 0 }}>
            <div className="cs-current-lbl">{t("champ.yourchamp")}</div>
            <div className="cs-current-name">{champion.name}</div>
            <div className="cs-current-react">{t(championReactionKey(champion.code))}</div>
          </div>
          <Link href="/" className="btn ghost cs-back">
            ← {t("nav.dashboard")}
          </Link>
        </div>
      )}

      <div className="cs-meta">
        <span className="cs-legend">{t("champ.oddsnote")}</span>
        {canChange ? (
          <span className="pill pts">{t("champ.changesleft", { n: left })}</span>
        ) : champion ? (
          <span className="pill locked">{t("champ.nochanges")}</span>
        ) : null}
      </div>

      {canChange && (
        <input
          className="cs-search"
          placeholder={`🔍  ${t("champ.searchph")}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {err && <div className="err" style={{ marginTop: 10 }}>{err}</div>}

      {canChange && (
        <div className="cs-grid">
          {filtered.map((tm, i) => {
            const isSel = selected === tm.id;
            const isChamp = championId === tm.id;
            const fav = sorted.indexOf(tm) < 3 && !query;
            return (
              <button
                key={tm.id}
                className={`cs-card ${isSel ? "sel" : ""} ${isChamp ? "champ" : ""}`}
                onClick={() => setSelected(tm.id)}
                disabled={busy}
              >
                {fav && <span className="cs-fav">★</span>}
                {isChamp && <span className="cs-check">✓</span>}
                <Flag code={tm.code} emoji={tm.flag} w={44} className="cs-flag" />
                <span className="cs-name">{tm.name}</span>
                {tm.odds != null && <span className="cs-odds">{tm.odds}×</span>}
              </button>
            );
          })}
          {filtered.length === 0 && <div className="mini-note">{t("champ.noresults")}</div>}
        </div>
      )}

      {/* sticky confirm bar */}
      {pending && pending.id !== championId && (
        <div className="cs-confirm">
          <div className="cs-confirm-team">
            <Flag code={pending.code} emoji={pending.flag} w={30} />
            <div style={{ minWidth: 0 }}>
              <div className="cs-confirm-name">{pending.name}</div>
              <div className="cs-confirm-react">{t(championReactionKey(pending.code))}</div>
            </div>
          </div>
          <button className="btn primary" onClick={confirm} disabled={busy}>
            {busy ? t("pw.saving") : t("champ.confirm")}
          </button>
        </div>
      )}
    </div>
  );
}
