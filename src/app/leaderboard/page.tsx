import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import Countdown from "@/components/Countdown";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

const MEDAL = ["🥇", "🥈", "🥉"];

/** Current streak = trailing run of consecutive points-scoring predictions, by kickoff. */
function currentStreak(preds: { points: number; scored: boolean; match: { kickoff: Date; status: string } }[]) {
  const done = preds
    .filter((p) => p.scored && p.match.status === "FINISHED")
    .sort((a, b) => a.match.kickoff.getTime() - b.match.kickoff.getTime());
  let streak = 0;
  for (let i = done.length - 1; i >= 0; i--) {
    if (done[i].points > 0) streak++;
    else break;
  }
  return streak;
}

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { lang, t } = getT();

  const users = await prisma.user.findMany({
    include: {
      predictions: { include: { match: true } },
      championTeam: true,
    },
    orderBy: [{ points: "desc" }, { name: "asc" }],
  });

  // Only show medals / GOAT / wood once real points exist, so nobody is
  // labelled "non-athletic" while everyone is still on zero.
  const scoringStarted = users.length > 0 && users[0].points > 0;
  const lastIndex = users.length - 1;

  return (
    <main className="wrap">
      <div className="label">{t("lb.eyebrow")}</div>
      <h1 className="page">{t("lb.title")}</h1>
      <p className="lead">{t("lb.lead")}</p>

      <Countdown lang={lang} />

      <div className="tbl-wrap" style={{ marginTop: 22 }}>
        {users.map((u, i) => {
          const exact = u.predictions.filter((p) => p.scored && p.points >= 5).length;
          const made = u.predictions.length;
          const streak = currentStreak(u.predictions);
          const isGoat = scoringStarted && i === 0;
          const isWood = scoringStarted && i === lastIndex && users.length > 3 && u.points >= 0;
          const rankDisplay = scoringStarted && i < 3 ? MEDAL[i] : isWood ? "🪵" : i + 1;

          return (
            <div key={u.id} className={`lb-row ${u.id === session.id ? "me" : ""}`}>
              <div className="lb-rank">{rankDisplay}</div>
              <div className="lb-who">
                <Avatar src={u.avatar} name={u.name} size={42} />
                <div style={{ minWidth: 0 }}>
                  <div className="nm" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {u.name}
                    {u.id === session.id ? t("lb.you") : ""}
                    {isGoat && <span className="badge goat">{t("lb.goat")}</span>}
                    {isWood && <span className="badge wood">{t("lb.wood")}</span>}
                    {streak >= 2 && (
                      <span className="badge fire" title={t("lb.streak", { n: streak })}>
                        🔥 {streak}
                      </span>
                    )}
                  </div>
                  <div className="ro">
                    {u.role} · {t("lb.picks", { n: made })} · {t("lb.exact", { n: exact })}
                    {u.championTeam && (
                      <>
                        {" · "}
                        <span title={t("lb.champ")}>
                          🏆 {u.championTeam.flag} {u.championTeam.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="lb-pts">
                {u.points}
                <small> {t("nav.pts")}</small>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
