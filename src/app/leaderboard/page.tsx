import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await prisma.user.findMany({
    include: { predictions: true, championTeam: true },
    orderBy: [{ points: "desc" }, { name: "asc" }],
  });

  return (
    <main className="wrap">
      <div className="label">Standings</div>
      <h1 className="page">🏅 Leaderboard</h1>
      <p className="lead">
        The Welyne table. Points come from match predictions plus a +15 bonus for correctly calling
        the champion.
      </p>

      <div className="tbl-wrap" style={{ marginTop: 22 }}>
        {users.map((u, i) => {
          const exact = u.predictions.filter((p) => p.scored && p.points >= 5).length;
          const made = u.predictions.length;
          return (
            <div key={u.id} className={`lb-row ${u.id === session.id ? "me" : ""}`}>
              <div className="lb-rank">{i + 1}</div>
              <div className="lb-who">
                <Avatar src={u.avatar} name={u.name} size={42} />
                <div style={{ minWidth: 0 }}>
                  <div className="nm">
                    {u.name}
                    {u.id === session.id ? " · you" : ""}
                  </div>
                  <div className="ro">
                    {u.role} · {made} picks · {exact} exact
                    {u.championTeam ? ` · 🏆 ${u.championTeam.flag}` : ""}
                  </div>
                </div>
              </div>
              <div className="lb-pts">
                {u.points}
                <small> pts</small>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
