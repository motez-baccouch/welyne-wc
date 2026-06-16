"use client";

import { useState } from "react";
import { Lang, tr } from "@/lib/i18n";

export default function ChangePassword({ lang = "en" }: { lang?: Lang }) {
  const t = (k: string) => tr(lang, k);
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
      setMsg({ ok: false, text: t("pw.nomatch") });
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
      setMsg({ ok: true, text: t("pw.updated") });
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setMsg({ ok: false, text: data.error ?? t("pw.failed") });
    }
  }

  if (!open) {
    return (
      <button className="btn ghost" onClick={() => setOpen(true)} style={{ marginTop: 8 }}>
        {t("pw.change")}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="pw-form">
      <div className="field">
        <label>{t("pw.current")}</label>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoFocus />
      </div>
      <div className="field">
        <label>{t("pw.new")}</label>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={t("pw.newph")} />
      </div>
      <div className="field">
        <label>{t("pw.confirm")}</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {msg && <div className={msg.ok ? "ok-msg" : "err"}>{msg.text}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button className="btn primary" disabled={loading}>
          {loading ? t("pw.saving") : t("pw.save")}
        </button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
          {t("pw.cancel")}
        </button>
      </div>
    </form>
  );
}
