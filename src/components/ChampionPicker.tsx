"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, tr } from "@/lib/i18n";

type Team = { id: number; code: string; name: string; flag: string; odds: number | null };

function reactionKey(code: string) {
  if (code === "POR") return "champ.react.POR";
  if (code === "TUN") return "champ.react.TUN";
  if (code === "FRA" || code === "ESP") return "champ.react.predictable";
  return "champ.react.default";
}

export default function ChampionPicker({
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

  const [championId, setChampionId] = useState<number | null>(current);
  const [left, setLeft] = useState<number>(changesLeft);
  // open the grid by default on first-ever pick
  const [open, setOpen] = useState<boolean>(current == null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const sorted = [...teams].sort((a, b) => (a.odds ?? 9999) - (b.odds ?? 9999));
  const champion = teams.find((x) => x.id === championId) ?? null;
  const canChange = !locked && left > 0;

  async function pick(id: number) {
    if (busy) return;
    setErr("");
    setBusy(true);
    const res = await fetch("/api/champion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: id }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setChampionId(id);
      if (typeof data.changesLeft === "number") setLeft(data.changesLeft);
      setOpen(false);
      router.refresh();
    } else {
      setErr(data.error ?? "Failed");
    }
  }

  // ── First-time / change grid ──
  if (open) {
    return (
      <div className="champ-box">
        <div className="champ-h">
          <strong>{champion ? t("champ.change") : t("champ.choosebig")}</strong>
          <div className="champ-sub">{t("champ.choosesub")}</div>
        </div>
        {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}
        <div className="champ-grid">
          {sorted.map((tm) => (
            <button
              key={tm.id}
              className={`champ-card ${tm.id === championId ? "sel" : ""}`}
              onClick={() => pick(tm.id)}
              disabled={busy}
            >
              <span className="cf">{tm.flag}</span>
              <span className="cn">{tm.name}</span>
              {tm.odds != null && <span className="cod">{tm.odds}</span>}
            </button>
          ))}
        </div>
        {champion && (
          <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>
            {t("champ.cancel")}
          </button>
        )}
      </div>
    );
  }

  // ── Current champion summary ──
  return (
    <div className="champ-box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div className="champ-lbl">{t("champ.yourchamp")}</div>
          <div className="champ-pick">
            <span className="cf">{champion?.flag}</span>
            <span>{champion?.name}</span>
          </div>
          {champion && <div className="champ-react">{t(reactionKey(champion.code))}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          {locked ? (
            <span className="pill locked">{t("champ.locked")}</span>
          ) : canChange ? (
            <>
              <button className="btn ghost" onClick={() => setOpen(true)}>
                {t("champ.change")}
              </button>
              <div className="mini-note" style={{ marginTop: 6 }}>
                {t("champ.changesleft", { n: left })}
              </div>
            </>
          ) : (
            <span className="pill locked">{t("champ.nochanges")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
