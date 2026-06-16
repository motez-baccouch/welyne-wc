import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { t } = getT();

  const teams = await prisma.team.findMany();
  const favorites = [...teams].sort((a, b) => (a.odds ?? 9999) - (b.odds ?? 9999)).slice(0, 8);

  return (
    <main className="wrap">
      <div className="label">{t("teams.eyebrow")}</div>
      <h1 className="page">{t("teams.title")}</h1>
      <p className="lead">{t("teams.lead")}</p>

      <h2 className="sec">{t("teams.favourites")}</h2>
      <div className="chipbar">
        {favorites.map((tm) => (
          <span key={tm.id} className="fchip">
            {tm.flag} {tm.name} · <b style={{ color: "var(--orange)" }}>{tm.odds}</b>
          </span>
        ))}
      </div>

      {GROUPS.map((g) => (
        <div key={g}>
          <div className="matchday-h">{t("matches.group", { g })}</div>
          <div className="teams-grid">
            {teams
              .filter((tm) => tm.groupName === g)
              .map((tm) => (
                <div key={tm.id} className="team-card">
                  <span className="flag">{tm.flag}</span>
                  <div>
                    <div className="nm">{tm.name}</div>
                    <div className="od">
                      {t("teams.titleodds")} <b>{tm.odds ?? "—"}</b>
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
