"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Lang } from "@/lib/i18n";

export default function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Lang = lang === "en" ? "fr" : "en";

  function switchLang() {
    // 1 year cookie
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <button
      className="icon-btn"
      onClick={switchLang}
      disabled={pending}
      aria-label={`Switch language to ${next.toUpperCase()}`}
      title={next === "fr" ? "Passer en français" : "Switch to English"}
    >
      <span className="ico">🌐</span>
      <span>{next.toUpperCase()}</span>
    </button>
  );
}
