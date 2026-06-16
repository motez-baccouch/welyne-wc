"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function sync() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/sync", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    setMsg(data.message ?? (data.ok ? "Synced." : data.error ?? "Failed."));
    if (data.ok) router.refresh();
  }

  return (
    <div className="note-box" style={{ borderLeftColor: "var(--green-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <strong style={{ color: "var(--text)" }}>🛠 Admin</strong>
          <div style={{ fontSize: "0.82rem" }}>
            Pull the latest results from football-data.org, or enter scores directly on each match
            card.
          </div>
        </div>
        <button className="btn ghost" onClick={sync} disabled={loading}>
          {loading ? "Syncing…" : "Sync results"}
        </button>
      </div>
      {msg && <div className="mini-note" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
