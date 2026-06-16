import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const teams = await prisma.team.findMany();
  const favorites = [...teams].sort((a, b) => (a.odds ?? 9999) - (b.odds ?? 9999)).slice(0, 8);

  return (
    <main className="wrap">
      <div className="label">48 nations · 12 groups</div>
      <h1 className="page">Teams & title odds</h1>
      <p className="lead">
        Indicative outright odds to lift the trophy (decimal — lower is more likely). Use them to
        guide your champion pick on the dashboard.
      </p>

      <h2 className="sec">⭐ Favourites</h2>
      <div className="chipbar">
        {favorites.map((t) => (
          <span key={t.id} className="fchip">
            {t.flag} {t.name} · <b style={{ color: "var(--orange)" }}>{t.odds}</b>
          </span>
        ))}
      </div>

      {GROUPS.map((g) => (
        <div key={g}>
          <div className="matchday-h">Group {g}</div>
          <div className="teams-grid">
            {teams
              .filter((t) => t.groupName === g)
              .map((t) => (
                <div key={t.id} className="team-card">
                  <span className="flag">{t.flag}</span>
                  <div>
                    <div className="nm">{t.name}</div>
                    <div className="od">
                      Title odds <b>{t.odds ?? "—"}</b>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </main>
  );
}
