"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, tr } from "@/lib/i18n";

export type MatchVM = {
  id: number;
  code: string;
  stage: string;
  groupName: string | null;
  kickoff: string;
  venue: string | null;
  status: string;
  homeName: string | null;
  homeFlag: string | null;
  awayName: string | null;
  awayFlag: string | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  homeScore: number | null;
  awayScore: number | null;
  teamsKnown: boolean;
};

function fmtKickoff(iso: string, lang: Lang) {
  const d = new Date(iso);
  return d.toLocaleString(lang === "fr" ? "fr-FR" : undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchCard({
  match,
  prediction,
  loggedIn,
  isAdmin,
  lang = "en",
}: {
  match: MatchVM;
  prediction: { home: number; away: number; points: number; scored: boolean } | null;
  loggedIn: boolean;
  isAdmin: boolean;
  lang?: Lang;
}) {
  const router = useRouter();
  const t = (k: string, v?: Record<string, string | number>) => tr(lang, k, v);
  const [home, setHome] = useState<string>(prediction ? String(prediction.home) : "");
  const [away, setAway] = useState<string>(prediction ? String(prediction.away) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  // admin
  const [aHome, setAHome] = useState<string>(match.homeScore != null ? String(match.homeScore) : "");
  const [aAway, setAAway] = useState<string>(match.awayScore != null ? String(match.awayScore) : "");

  const finished = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const kickoffPassed = new Date(match.kickoff).getTime() <= Date.now();
  const locked = finished || live || kickoffPassed;
  const canPredict = loggedIn && match.teamsKnown && !locked;

  async function save() {
    setErr("");
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (Number.isNaN(h) || Number.isNaN(a)) {
      setErr(t("mc.enterboth"));
      return;
    }
    setSaving(true);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, home: h, away: a }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      router.refresh();
    } else {
      setErr(data.error ?? t("mc.couldnotsave"));
    }
  }

  async function adminSave() {
    const res = await fetch("/api/admin/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: match.id,
        home: aHome,
        away: aAway,
        status: "FINISHED",
      }),
    });
    const data = await res.json();
    if (data.ok) router.refresh();
    else alert(data.error ?? "Failed");
  }

  function TeamRow({
    name,
    flag,
    placeholder,
    score,
    isInput,
    value,
    onChange,
    winner,
  }: {
    name: string | null;
    flag: string | null;
    placeholder: string | null;
    score: number | null;
    isInput: boolean;
    value: string;
    onChange: (v: string) => void;
    winner: boolean;
  }) {
    return (
      <div className={`teamline ${name ? "" : "tbd"}`}>
        <div className="tn">
          {name ? (
            <>
              <span className="flag">{flag}</span>
              <span className="nm" style={winner ? { color: "var(--win)" } : undefined}>
                {name}
              </span>
            </>
          ) : (
            <span className="nm">{placeholder ?? "TBD"}</span>
          )}
          {/* flag rendered above for known teams */}
        </div>
        {finished ? (
          <span className="finalscore" style={winner ? { color: "var(--win)" } : undefined}>
            {score ?? "–"}
          </span>
        ) : isInput ? (
          <input
            className="scorebox"
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            placeholder="–"
            aria-label={`${name} score`}
          />
        ) : (
          <input className="scorebox" value={value} disabled placeholder="–" />
        )}
      </div>
    );
  }

  const homeWin = finished && match.homeScore != null && match.awayScore != null && match.homeScore > match.awayScore;
  const awayWin = finished && match.homeScore != null && match.awayScore != null && match.awayScore > match.homeScore;

  return (
    <div className="mcard">
      <div className="meta">
        <span className="stage-tag">
          {tr(lang, `stage.${match.stage}`)}
          {match.groupName ? ` ${match.groupName}` : ""}
        </span>
        <span className="status">
          {live && <span className="dot-live" />}
          {finished ? t("mc.fulltime") : live ? t("mc.live") : fmtKickoff(match.kickoff, lang)}
        </span>
      </div>

      <TeamRow
        name={match.homeName}
        flag={match.homeFlag}
        placeholder={match.homePlaceholder}
        score={match.homeScore}
        isInput={canPredict}
        value={home}
        onChange={setHome}
        winner={homeWin}
      />
      <TeamRow
        name={match.awayName}
        flag={match.awayFlag}
        placeholder={match.awayPlaceholder}
        score={match.awayScore}
        isInput={canPredict}
        value={away}
        onChange={setAway}
        winner={awayWin}
      />

      {err && <div className="mini-note" style={{ color: "var(--lose)" }}>{err}</div>}

      <div className="foot">
        <span>{match.venue ?? ""}</span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {finished && prediction && (
            <span className={`pill ${prediction.points > 0 ? "win" : "locked"}`}>
              {t("mc.ptsline", { h: prediction.home, a: prediction.away, pts: prediction.points })}
            </span>
          )}
          {finished && !prediction && <span className="pill locked">{t("mc.nopick")}</span>}
          {!finished && locked && match.teamsKnown && (
            <span className="pill locked">
              {prediction ? t("mc.yourpick", { h: prediction.home, a: prediction.away }) : t("mc.locked")}
            </span>
          )}
          {canPredict && (
            <button className={`save-btn ${saved ? "saved" : ""}`} onClick={save} disabled={saving}>
              {saved ? t("mc.saved") : saving ? t("mc.saving") : prediction ? t("mc.update") : t("mc.predict")}
            </button>
          )}
          {!match.teamsKnown && <span className="pill locked">{t("mc.awaiting")}</span>}
        </span>
      </div>

      {isAdmin && match.teamsKnown && (
        <div className="admin-row">
          <span className="tag">{t("mc.adminresult")}</span>
          <input value={aHome} onChange={(e) => setAHome(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
          <span>–</span>
          <input value={aAway} onChange={(e) => setAAway(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
          <button className="save-btn" onClick={adminSave}>
            {t("mc.setft")}
          </button>
        </div>
      )}
    </div>
  );
}
