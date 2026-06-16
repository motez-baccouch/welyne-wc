import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const matches = (await prisma.match.findMany({
    where: { stage: { not: "GROUP" } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { code: "asc" },
  })) as unknown as M[];

  const byStage = (st: string) => matches.filter((m) => m.stage === st);
  const cols: { title: string; stage: string }[] = [
    { title: "Round of 32", stage: "R32" },
    { title: "Round of 16", stage: "R16" },
    { title: "Quarter-finals", stage: "QF" },
    { title: "Semi-finals", stage: "SF" },
    { title: "Final", stage: "FINAL" },
  ];
  const third = byStage("THIRD");

  return (
    <main className="wrap">
      <div className="label">Knockout phase</div>
      <h1 className="page">🏆 The road to MetLife</h1>
      <p className="lead">
        The bracket fills in as the group stage finishes. Slots show the qualification path until
        teams are confirmed; once both teams are known you can predict each tie on the Matches page.
      </p>

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
          <h2 className="sec">🥉 Third-place play-off</h2>
          <div style={{ maxWidth: 280 }}>
            <Tie m={third[0]} />
          </div>
        </>
      )}
    </main>
  );
}
