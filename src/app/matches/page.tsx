import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMatchVM } from "@/lib/view";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const KO_LABEL: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  THIRD: "Third-place play-off",
  FINAL: "Final",
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { f?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const filter = searchParams.f ?? "A";
  const isKnockout = filter === "ko";

  const matches = await prisma.match.findMany({
    where: isKnockout
      ? { stage: { not: "GROUP" } }
      : { stage: "GROUP", groupName: filter },
    include: { homeTeam: true, awayTeam: true },
    orderBy: [{ kickoff: "asc" }],
  });

  const myPreds = await prisma.prediction.findMany({
    where: { userId: session.id, matchId: { in: matches.map((m) => m.id) } },
  });
  const predMap = new Map(myPreds.map((p) => [p.matchId, p]));
  const vmPred = (id: number) => {
    const p = predMap.get(id);
    return p ? { home: p.homePred, away: p.awayPred, points: p.points, scored: p.scored } : null;
  };

  // group rendering buckets
  const buckets: { title: string; items: typeof matches }[] = [];
  if (isKnockout) {
    for (const st of ["R32", "R16", "QF", "SF", "THIRD", "FINAL"]) {
      const items = matches.filter((m) => m.stage === st);
      if (items.length) buckets.push({ title: KO_LABEL[st], items });
    }
  } else {
    for (const md of [1, 2, 3]) {
      const items = matches.filter((m) => m.matchday === md);
      if (items.length) buckets.push({ title: `Matchday ${md}`, items });
    }
  }

  return (
    <main className="wrap">
      <div className="label">Fixtures & predictions</div>
      <h1 className="page">Matches</h1>
      <p className="lead">
        Enter a scoreline for each match before kick-off. Predictions lock automatically when the
        match starts.
      </p>

      <div className="chipbar">
        {GROUPS.map((g) => (
          <Link key={g} href={`/matches?f=${g}`} className={`fchip ${filter === g ? "active" : ""}`}>
            Group {g}
          </Link>
        ))}
        <Link href="/matches?f=ko" className={`fchip ${isKnockout ? "active" : ""}`}>
          🏆 Knockouts
        </Link>
      </div>

      {buckets.length === 0 && (
        <div className="note-box">
          Nothing here yet. If the app was just deployed, an admin needs to run setup first.
        </div>
      )}

      {buckets.map((b) => (
        <div key={b.title}>
          <div className="matchday-h">{b.title}</div>
          <div className="match-grid">
            {b.items.map((m) => (
              <MatchCard
                key={m.id}
                match={toMatchVM(m)}
                prediction={vmPred(m.id)}
                loggedIn
                isAdmin={session.isAdmin}
              />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
