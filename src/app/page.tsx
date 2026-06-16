import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMatchVM } from "@/lib/view";
import MatchCard from "@/components/MatchCard";
import SyncButton from "@/components/SyncButton";
import Flag from "@/components/Flag";
import { BallDoodle } from "@/components/Doodles";
import Countdown from "@/components/Countdown";
import { getT } from "@/lib/i18n.server";
import { championReactionKey } from "@/lib/champion";

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
  // First-time onboarding: send people who haven't picked a champion to the
  // dedicated selection page.
  if (me.championTeamId == null) redirect("/champion");

  const [rankAbove, totalUsers, totalMatches, finishedCount] = await Promise.all([
    prisma.user.count({ where: { points: { gt: me.points } } }),
    prisma.user.count(),
    prisma.match.count(),
    prisma.match.count({ where: { status: "FINISHED" } }),
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

      {me.championTeam && (
        <div className="champ-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
              <Flag code={me.championTeam.code} emoji={me.championTeam.flag} w={40} />
              <div style={{ minWidth: 0 }}>
                <div className="champ-lbl">{t("champ.yourchamp")}</div>
                <div style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
                  {me.championTeam.name}
                </div>
                <div className="champ-react">{t(championReactionKey(me.championTeam.code))}</div>
              </div>
            </div>
            {championLocked ? (
              <span className="pill locked">{t("champ.locked")}</span>
            ) : (
              <Link href="/champion" className="btn ghost">
                {t("champ.change")}
              </Link>
            )}
          </div>
        </div>
      )}

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

      <Countdown lang={lang} />

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
