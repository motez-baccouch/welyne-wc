import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMatchVM } from "@/lib/view";
import MatchCard from "@/components/MatchCard";
import ChampionPicker from "@/components/ChampionPicker";
import SyncButton from "@/components/SyncButton";
import { BallDoodle } from "@/components/Doodles";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.id },
    include: { championTeam: true },
  });
  if (!me) redirect("/login");

  const [rankAbove, totalUsers, totalMatches, finishedCount, teams] = await Promise.all([
    prisma.user.count({ where: { points: { gt: me.points } } }),
    prisma.user.count(),
    prisma.match.count(),
    prisma.match.count({ where: { status: "FINISHED" } }),
    prisma.team.findMany({ orderBy: { odds: "asc" } }),
  ]);
  const rank = rankAbove + 1;

  const now = new Date();

  const upcoming = await prisma.match.findMany({
    where: {
      status: "SCHEDULED",
      kickoff: { gt: now },
      homeTeamId: { not: null },
      awayTeamId: { not: null },
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: "asc" },
    take: 6,
  });

  const recent = await prisma.match.findMany({
    where: { status: "FINISHED" },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: "desc" },
    take: 4,
  });

  const matchIds = [...upcoming, ...recent].map((m) => m.id);
  const myPreds = await prisma.prediction.findMany({
    where: { userId: me.id, matchId: { in: matchIds } },
  });
  const predMap = new Map(myPreds.map((p) => [p.matchId, p]));

  const myPredCount = await prisma.prediction.count({ where: { userId: me.id } });

  const finalMatch = await prisma.match.findUnique({ where: { code: "FIN" } });
  const championLocked = finalMatch?.status === "FINISHED";

  function vmPred(matchId: number) {
    const p = predMap.get(matchId);
    return p ? { home: p.homePred, away: p.awayPred, points: p.points, scored: p.scored } : null;
  }

  return (
    <main className="wrap">
      <div style={{ position: "relative" }}>
        <div className="hero-doodle">
          <BallDoodle size={140} />
        </div>
        <div className="label">Welcome back</div>
        <h1 className="page">
          Hi {me.name.split(" ")[0]} <span className="we">⚽</span>
        </h1>
        <p className="lead">
          Predict every World Cup 2026 match. Exact score = 5 pts · goal difference = 3 · correct
          outcome = 2. Knockouts count 1.5×.
        </p>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="n">{me.points}</div>
          <div className="l">Your points</div>
        </div>
        <div className="tile">
          <div className="n">#{rank}</div>
          <div className="l">Rank of {totalUsers}</div>
        </div>
        <div className="tile">
          <div className="n">{myPredCount}</div>
          <div className="l">Predictions made</div>
        </div>
        <div className="tile">
          <div className="n">
            {finishedCount}
            <span style={{ color: "var(--muted)", fontSize: "1.2rem" }}>/{totalMatches}</span>
          </div>
          <div className="l">Matches played</div>
        </div>
      </div>

      <ChampionPicker
        teams={teams.map((t) => ({ id: t.id, name: t.name, flag: t.flag, odds: t.odds }))}
        current={me.championTeamId}
        locked={championLocked}
      />

      {me.isAdmin && <SyncButton />}

      <div className="row-between">
        <h2 className="sec" style={{ margin: "30px 0 0" }}>
          ⏱ Predict next
        </h2>
        <Link href="/matches" className="pill pts">
          All matches →
        </Link>
      </div>
      {upcoming.length === 0 ? (
        <div className="note-box">No open matches right now — check back soon or browse all matches.</div>
      ) : (
        <div className="match-grid" style={{ marginTop: 16 }}>
          {upcoming.map((m) => (
            <MatchCard
              key={m.id}
              match={toMatchVM(m)}
              prediction={vmPred(m.id)}
              loggedIn
              isAdmin={me.isAdmin}
            />
          ))}
        </div>
      )}

      <h2 className="sec">📋 Latest results</h2>
      {recent.length === 0 ? (
        <div className="note-box">No matches have finished yet.</div>
      ) : (
        <div className="match-grid">
          {recent.map((m) => (
            <MatchCard
              key={m.id}
              match={toMatchVM(m)}
              prediction={vmPred(m.id)}
              loggedIn
              isAdmin={me.isAdmin}
            />
          ))}
        </div>
      )}
    </main>
  );
}
