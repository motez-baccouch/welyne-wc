import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const session = await getSession();
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
        <Link href="/">Dashboard</Link>
        <Link href="/matches">Matches</Link>
        <Link href="/groups">Groups</Link>
        <Link href="/bracket">Bracket</Link>
        <Link href="/teams">Teams</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        {session && <Link href="/me">My Picks</Link>}
      </nav>

      {session ? (
        <div className="user-chip">
          <Link href="/me" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar src={session.avatar} name={session.name} size={30} />
            <span>
              {session.name.split(" ")[0]} · <span className="pts">{points} pts</span>
            </span>
          </Link>
          <LogoutButton />
        </div>
      ) : (
        <Link href="/login" className="pill pts">
          Sign in
        </Link>
      )}
    </header>
  );
}
