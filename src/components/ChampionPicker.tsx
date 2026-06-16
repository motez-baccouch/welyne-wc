"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChampionPicker({
  teams,
  current,
  locked,
}: {
  teams: { id: number; name: string; flag: string; odds: number | null }[];
  current: number | null;
  locked: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(current ? String(current) : "");
  const [saved, setSaved] = useState(false);

  async function save(id: string) {
    setValue(id);
    const res = await fetch("/api/champion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: Number(id) }),
    });
    const data = await res.json();
    if (data.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      router.refresh();
    } else {
      alert(data.error ?? "Failed");
    }
  }

  return (
    <div className="note-box" style={{ borderLeftColor: "var(--orange)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <strong style={{ color: "var(--text)" }}>🏆 Your champion pick</strong>
          <div style={{ fontSize: "0.82rem" }}>
            Predict the winner — worth <b style={{ color: "var(--orange)" }}>+15 pts</b> if you nail it.
          </div>
        </div>
        {locked ? (
          <span className="pill locked">Locked</span>
        ) : (
          <select
            className="scorebox"
            style={{ width: "auto", height: 40, padding: "0 12px", fontSize: "0.95rem", fontWeight: 600 }}
            value={value}
            onChange={(e) => save(e.target.value)}
          >
            <option value="">Choose…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag} {t.name}
                {t.odds ? ` (${t.odds})` : ""}
              </option>
            ))}
          </select>
        )}
        {saved && <span className="pill win">Saved ✓</span>}
      </div>
    </div>
  );
}
