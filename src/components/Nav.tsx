import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n.server";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import MobileMenu from "./MobileMenu";

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

  const links = [
    { href: "/", label: t("nav.dashboard") },
    { href: "/matches", label: t("nav.matches") },
    { href: "/groups", label: t("nav.groups") },
    { href: "/bracket", label: t("nav.bracket") },
    { href: "/teams", label: t("nav.teams") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
    ...(session ? [{ href: "/me", label: t("nav.mypicks") }] : []),
  ];

  return (
    <header className="top">
      <Link href="/" className="wm">
        <span className="ball">⚽</span>
        <span>
          <span className="we">we</span>lyne <span style={{ color: "var(--muted)" }}>·</span> WC26
        </span>
      </Link>

      <nav className="main">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
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
          <Link href="/login" className="pill pts signin-desktop">
            {t("nav.signin")}
          </Link>
        )}

        <MobileMenu
          links={links}
          session={session ? { name: session.name, avatar: session.avatar ?? null, points } : null}
          signIn={t("nav.signin")}
          signOut={t("sync.logout")}
        />
      </div>
    </header>
  );
}
