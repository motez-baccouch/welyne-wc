import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n.server";
import { MAX_CHAMPION_CHANGES } from "@/lib/champion";
import ChampionSelect from "@/components/ChampionSelect";
import { TrophyDoodle } from "@/components/Doodles";

export const dynamic = "force-dynamic";

export default async function ChampionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { lang, t } = getT();

  const [me, teams, finalMatch] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id } }),
    prisma.team.findMany({ orderBy: { odds: "asc" } }),
    prisma.match.findUnique({ where: { code: "FIN" } }),
  ]);
  if (!me) redirect("/login");

  const locked = finalMatch?.status === "FINISHED";

  return (
    <main className="wrap cs-main">
      <div className="cs-hero">
        <div className="cs-hero-glow" />
        <div className="cs-hero-trophy">
          <TrophyDoodle size={108} />
        </div>
        <div className="label">{t("champ.page.eyebrow")}</div>
        <h1 className="page">{t("champ.choosebig")}</h1>
        <p className="lead">{t("champ.choosesub")}</p>
      </div>

      <ChampionSelect
        teams={teams.map((tm) => ({ id: tm.id, code: tm.code, name: tm.name, flag: tm.flag, odds: tm.odds }))}
        current={me.championTeamId}
        changesLeft={Math.max(0, MAX_CHAMPION_CHANGES - me.championChanges)}
        locked={locked}
        lang={lang}
      />
    </main>
  );
}
