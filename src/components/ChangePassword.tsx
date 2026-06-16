"use client";

import { useState } from "react";

export default function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) {
      setMsg({ ok: false, text: "New passwords don't match." });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setMsg({ ok: true, text: "Password updated ✓" });
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setMsg({ ok: false, text: data.error ?? "Could not update password." });
    }
  }

  if (!open) {
    return (
      <button className="btn ghost" onClick={() => setOpen(true)} style={{ marginTop: 8 }}>
        Change password
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="pw-form">
      <div className="field">
        <label>Current password</label>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoFocus />
      </div>
      <div className="field">
        <label>New password</label>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="at least 6 characters" />
      </div>
      <div className="field">
        <label>Confirm new password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {msg && <div className={msg.ok ? "ok-msg" : "err"}>{msg.text}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button className="btn primary" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
