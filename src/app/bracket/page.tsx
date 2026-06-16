import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

type M = {
  code: string;
  stage: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { name: string; flag: string } | null;
  awayTeam: { name: string; flag: string } | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
};

function Tie({ m }: { m: M }) {
  const finished = m.status === "FINISHED" && m.homeScore != null && m.awayScore != null;
  const homeWin = finished && (m.homeScore as number) > (m.awayScore as number);
  const awayWin = finished && (m.awayScore as number) > (m.homeScore as number);
  const known = m.homeTeam && m.awayTeam;

  return (
    <div className={`btie ${known ? "" : "tbd"}`}>
      <div className={`r ${homeWin ? "w" : ""}`}>
        <span className="nm">
          {m.homeTeam ? (
            <>
              <span>{m.homeTeam.flag}</span>
              <span className="nmt">{m.homeTeam.name}</span>
            </>
          ) : (
            <span className="nmt">{m.homePlaceholder ?? "TBD"}</span>
          )}
        </span>
        {finished && <span className="sc">{m.homeScore}</span>}
      </div>
      <div className={`r ${awayWin ? "w" : ""}`}>
        <span className="nm">
          {m.awayTeam ? (
            <>
              <span>{m.awayTeam.flag}</span>
              <span className="nmt">{m.awayTeam.name}</span>
            </>
          ) : (
            <span className="nmt">{m.awayPlaceholder ?? "TBD"}</span>
          )}
        </span>
        {finished && <span className="sc">{m.awayScore}</span>}
      </div>
    </div>
  );
}

export default async function BracketPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { t } = getT();

  const matches = (await prisma.match.findMany({
    where: { stage: { not: "GROUP" } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { code: "asc" },
  })) as unknown as M[];

  const byStage = (st: string) => matches.filter((m) => m.stage === st);
  const cols: { title: string; stage: string }[] = [
    { title: t("stage.R32"), stage: "R32" },
    { title: t("stage.R16"), stage: "R16" },
    { title: t("stage.QFs"), stage: "QF" },
    { title: t("stage.SFs"), stage: "SF" },
    { title: t("stage.FINAL"), stage: "FINAL" },
  ];
  const third = byStage("THIRD");

  return (
    <main className="wrap">
      <div className="label">{t("bracket.eyebrow")}</div>
      <h1 className="page">{t("bracket.title")}</h1>
      <p className="lead">{t("bracket.lead")}</p>

      <div className="bracket" style={{ marginTop: 24 }}>
        {cols.map((c) => (
          <div key={c.stage} className="bcol">
            <h4>{c.title}</h4>
            {byStage(c.stage).map((m) => (
              <Tie key={m.code} m={m} />
            ))}
          </div>
        ))}
      </div>

      {third.length > 0 && (
        <>
          <h2 className="sec">{t("bracket.third")}</h2>
          <div style={{ maxWidth: 280 }}>
            <Tie m={third[0]} />
          </div>
        </>
      )}
    </main>
  );
}
