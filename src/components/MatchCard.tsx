"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

const STAGE_LABEL: Record<string, string> = {
  GROUP: "Group",
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-final",
  SF: "Semi-final",
  THIRD: "Third place",
  FINAL: "Final",
};

function fmtKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
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
}: {
  match: MatchVM;
  prediction: { home: number; away: number; points: number; scored: boolean } | null;
  loggedIn: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
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
      setErr("Enter both scores.");
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
      setErr(data.error ?? "Could not save.");
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
          {STAGE_LABEL[match.stage] ?? match.stage}
          {match.groupName ? ` ${match.groupName}` : ""}
        </span>
        <span className="status">
          {live && <span className="dot-live" />}
          {finished ? "Full time" : live ? "Live" : fmtKickoff(match.kickoff)}
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
              {prediction.home}-{prediction.away} · {prediction.points} pts
            </span>
          )}
          {finished && !prediction && <span className="pill locked">No pick</span>}
          {!finished && locked && match.teamsKnown && (
            <span className="pill locked">
              {prediction ? `Your pick ${prediction.home}-${prediction.away}` : "Locked"}
            </span>
          )}
          {canPredict && (
            <button className={`save-btn ${saved ? "saved" : ""}`} onClick={save} disabled={saving}>
              {saved ? "Saved ✓" : saving ? "Saving…" : prediction ? "Update" : "Predict"}
            </button>
          )}
          {!match.teamsKnown && <span className="pill locked">Awaiting teams</span>}
        </span>
      </div>

      {isAdmin && match.teamsKnown && (
        <div className="admin-row">
          <span className="tag">Admin result</span>
          <input value={aHome} onChange={(e) => setAHome(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
          <span>–</span>
          <input value={aAway} onChange={(e) => setAAway(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
          <button className="save-btn" onClick={adminSave}>
            Set FT
          </button>
        </div>
      )}
    </div>
  );
}
