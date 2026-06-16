import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n.server";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";

export default async function Nav() {
  const session = await getSession();
  const { lang, t } = getT();
  let points = 0;
  if (session) {
    const u = await prisma.user.findUnique({
      where: { id: session.id },
      select: { points: true },
    });
    points = u?.points ?? 0;
  }

  return (
    <header className="top">
      <Link href="/" className="wm">
        <span className="ball">⚽</span>
        <span>
          <span className="we">we</span>lyne <span style={{ color: "var(--muted)" }}>·</span> WC26
        </span>
      </Link>

      <nav className="main">
        <Link href="/">{t("nav.dashboard")}</Link>
        <Link href="/matches">{t("nav.matches")}</Link>
        <Link href="/groups">{t("nav.groups")}</Link>
        <Link href="/bracket">{t("nav.bracket")}</Link>
        <Link href="/teams">{t("nav.teams")}</Link>
        <Link href="/leaderboard">{t("nav.leaderboard")}</Link>
        {session && <Link href="/me">{t("nav.mypicks")}</Link>}
      </nav>

      <div className="nav-tools">
        <LangToggle lang={lang} />
        <ThemeToggle />
        {session ? (
          <div className="user-chip">
            <Link href="/me" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar src={session.avatar} name={session.name} size={30} />
              <span>
                {session.name.split(" ")[0]} · <span className="pts">{points} {t("nav.pts")}</span>
              </span>
            </Link>
            <LogoutButton label={t("sync.logout")} />
          </div>
        ) : (
          <Link href="/login" className="pill pts">
            {t("nav.signin")}
          </Link>
        )}
      </div>
    </header>
  );
}
