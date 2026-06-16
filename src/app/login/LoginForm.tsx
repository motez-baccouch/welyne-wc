"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BallDoodle } from "@/components/Doodles";
import { Lang, tr } from "@/lib/i18n";

export default function LoginForm({ lang = "en" }: { lang?: Lang }) {
  const router = useRouter();
  const t = (k: string) => tr(lang, k);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      router.push("/");
      router.refresh();
    } else {
      setErr(data.error ?? t("login.failed"));
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-doodle">
          <BallDoodle size={130} />
        </div>
        <div className="ball-hero">⚽</div>
        <h1>
          <span className="we">WE</span> predict.
        </h1>
        <p>{t("login.sub")}</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>{t("login.name")}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("login.nameph")}
              autoCapitalize="none"
              autoFocus
            />
          </div>
          <div className="field">
            <label>{t("login.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? t("login.signingin") : t("login.kickoff")}
          </button>
        </form>
      </div>
    </div>
  );
}
