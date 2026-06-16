import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMatchVM } from "@/lib/view";
import MatchCard from "@/components/MatchCard";
import ChampionPicker from "@/components/ChampionPicker";
import SyncButton from "@/components/SyncButton";
import { BallDoodle } from "@/components/Doodles";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { lang, t } = getT();

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
        <div className="label">{t("dash.welcome")}</div>
        <h1 className="page">
          {t("dash.hi", { name: me.name.split(" ")[0] })} <span className="we">⚽</span>
        </h1>
        <p className="lead">{t("dash.lead")}</p>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="n">{me.points}</div>
          <div className="l">{t("dash.points")}</div>
        </div>
        <div className="tile">
          <div className="n">#{rank}</div>
          <div className="l">{t("dash.rankof", { n: totalUsers })}</div>
        </div>
        <div className="tile">
          <div className="n">{myPredCount}</div>
          <div className="l">{t("dash.predsmade")}</div>
        </div>
        <div className="tile">
          <div className="n">
            {finishedCount}
            <span style={{ color: "var(--muted)", fontSize: "1.2rem" }}>/{totalMatches}</span>
          </div>
          <div className="l">{t("dash.played")}</div>
        </div>
      </div>

      <ChampionPicker
        teams={teams.map((tm) => ({ id: tm.id, name: tm.name, flag: tm.flag, odds: tm.odds }))}
        current={me.championTeamId}
        locked={championLocked}
        lang={lang}
      />

      {me.isAdmin && <SyncButton lang={lang} />}

      <div className="row-between">
        <h2 className="sec" style={{ margin: "30px 0 0" }}>
          {t("dash.predictnext")}
        </h2>
        <Link href="/matches" className="pill pts">
          {t("dash.allmatches")}
        </Link>
      </div>
      {upcoming.length === 0 ? (
        <div className="note-box">{t("dash.noopen")}</div>
      ) : (
        <div className="match-grid" style={{ marginTop: 16 }}>
          {upcoming.map((m) => (
            <MatchCard
              key={m.id}
              match={toMatchVM(m)}
              prediction={vmPred(m.id)}
              loggedIn
              isAdmin={me.isAdmin}
              lang={lang}
            />
          ))}
        </div>
      )}

      <h2 className="sec">{t("dash.latest")}</h2>
      {recent.length === 0 ? (
        <div className="note-box">{t("dash.nofinished")}</div>
      ) : (
        <div className="match-grid">
          {recent.map((m) => (
            <MatchCard
              key={m.id}
              match={toMatchVM(m)}
              prediction={vmPred(m.id)}
              loggedIn
              isAdmin={me.isAdmin}
              lang={lang}
            />
          ))}
        </div>
      )}
    </main>
  );
}
