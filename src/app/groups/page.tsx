import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeGroupStandings } from "@/lib/standings";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default async function GroupsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { t } = getT();

  const teams = await prisma.team.findMany();
  const matches = await prisma.match.findMany({ where: { stage: "GROUP" } });

  return (
    <main className="wrap">
      <div className="label">{t("groups.eyebrow")}</div>
      <h1 className="page">{t("groups.title")}</h1>
      <p className="lead">{t("groups.lead")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 18, marginTop: 24 }}>
        {GROUPS.map((g) => {
          const gTeams = teams
            .filter((t) => t.groupName === g)
            .map((t) => ({ id: t.id, code: t.code, name: t.name, flag: t.flag }));
          const gMatches = matches.filter((m) => m.groupName === g);
          const rows = computeGroupStandings(gTeams, gMatches);
          return (
            <div key={g}>
              <div className="matchday-h" style={{ marginTop: 0 }}>
                {t("matches.group", { g })}
              </div>
              <div className="tbl-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>{t("groups.th.team")}</th>
                      <th>{t("groups.th.p")}</th>
                      <th>{t("groups.th.w")}</th>
                      <th>{t("groups.th.d")}</th>
                      <th>{t("groups.th.l")}</th>
                      <th>{t("groups.th.gd")}</th>
                      <th>{t("groups.th.pts")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.team.id} className={i < 2 ? "qualify" : i === 2 ? "third" : ""}>
                        <td className="team">
                          <span className="pos">{i + 1}</span>
                          <span style={{ fontSize: "1.2rem" }}>{r.team.flag}</span>
                          <span>{r.team.name}</span>
                        </td>
                        <td>{r.played}</td>
                        <td>{r.won}</td>
                        <td>{r.drawn}</td>
                        <td>{r.lost}</td>
                        <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                        <td style={{ fontWeight: 800, color: "var(--orange)" }}>{r.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
