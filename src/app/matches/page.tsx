import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMatchVM } from "@/lib/view";
import MatchCard from "@/components/MatchCard";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const KO_STAGES = ["R32", "R16", "QF", "SF", "THIRD", "FINAL"];
const KO_KEY: Record<string, string> = {
  R32: "stage.R32",
  R16: "stage.R16",
  QF: "stage.QFs",
  SF: "stage.SFs",
  THIRD: "stage.THIRDplay",
  FINAL: "stage.FINAL",
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { f?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { lang, t } = getT();

  const filter = searchParams.f ?? "A";
  const isKnockout = filter === "ko";
  const isPlayed = filter === "played";

  const matches = await prisma.match.findMany({
    where: isPlayed
      ? { status: "FINISHED" }
      : isKnockout
      ? { stage: { not: "GROUP" } }
      : { stage: "GROUP", groupName: filter },
    include: { homeTeam: true, awayTeam: true },
    orderBy: isPlayed ? [{ kickoff: "desc" }] : [{ kickoff: "asc" }],
  });

  const myPreds = await prisma.prediction.findMany({
    where: { userId: session.id, matchId: { in: matches.map((m) => m.id) } },
  });
  const predMap = new Map(myPreds.map((p) => [p.matchId, p]));
  const vmPred = (id: number) => {
    const p = predMap.get(id);
    return p ? { home: p.homePred, away: p.awayPred, points: p.points, scored: p.scored } : null;
  };

  // rendering buckets
  const buckets: { title: string; items: typeof matches }[] = [];
  if (isPlayed) {
    if (matches.length) buckets.push({ title: t("matches.allplayed"), items: matches });
  } else if (isKnockout) {
    for (const st of KO_STAGES) {
      const items = matches.filter((m) => m.stage === st);
      if (items.length) buckets.push({ title: t(KO_KEY[st]), items });
    }
  } else {
    for (const md of [1, 2, 3]) {
      const items = matches.filter((m) => m.matchday === md);
      if (items.length) buckets.push({ title: t("matches.matchday", { n: md }), items });
    }
  }

  return (
    <main className="wrap">
      <div className="label">{t("matches.eyebrow")}</div>
      <h1 className="page">{t("matches.title")}</h1>
      <p className="lead">{t("matches.lead")}</p>

      <div className="chipbar">
        {GROUPS.map((g) => (
          <Link key={g} href={`/matches?f=${g}`} className={`fchip ${filter === g ? "active" : ""}`}>
            {t("matches.group", { g })}
          </Link>
        ))}
        <Link href="/matches?f=ko" className={`fchip ${isKnockout ? "active" : ""}`}>
          {t("matches.knockouts")}
        </Link>
        <Link href="/matches?f=played" className={`fchip ${isPlayed ? "active" : ""}`}>
          {t("matches.played")}
        </Link>
      </div>

      {buckets.length === 0 && (
        <div className="note-box">{isPlayed ? t("matches.noplayed") : t("matches.empty")}</div>
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
                lang={lang}
              />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
