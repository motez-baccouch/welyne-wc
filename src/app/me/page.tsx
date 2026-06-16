import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrophyDoodle } from "@/components/Doodles";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  GROUP: "Group",
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-final",
  SF: "Semi-final",
  THIRD: "Third place",
  FINAL: "Final",
};

function fmt(d: Date) {
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.id },
    include: { championTeam: true },
  });
  if (!me) redirect("/login");

  const preds = await prisma.prediction.findMany({
    where: { userId: me.id },
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
    orderBy: { match: { kickoff: "asc" } },
  });

  const finished = preds.filter((p) => p.match.status === "FINISHED");
  const exact = finished.filter(
    (p) => p.homePred === p.match.homeScore && p.awayPred === p.match.awayScore
  ).length;
  const correct = finished.filter((p) => p.points > 0).length;
  const fromMatches = preds.reduce((s, p) => s + p.points, 0);

  const scored = preds.filter((p) => p.match.status === "FINISHED");
  const open = preds.filter((p) => p.match.status !== "FINISHED");

  function Row({ p }: { p: (typeof preds)[number] }) {
    const m = p.match;
    const fin = m.status === "FINISHED";
    return (
      <div className="lb-row" style={{ gridTemplateColumns: "1fr auto auto", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span>
              {m.homeTeam ? `${m.homeTeam.flag} ${m.homeTeam.name}` : m.homePlaceholder}
            </span>
            <span style={{ color: "var(--muted)" }}>vs</span>
            <span>
              {m.awayTeam ? `${m.awayTeam.flag} ${m.awayTeam.name}` : m.awayPlaceholder}
            </span>
          </div>
          <div className="ro" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
            {STAGE_LABEL[m.stage]}
            {m.groupName ? ` ${m.groupName}` : ""} · {fmt(m.kickoff)}
          </div>
        </div>
        <div style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".1em", color: "var(--muted)" }}>
            PICK
          </div>
          <div style={{ fontWeight: 800 }}>
            {p.homePred}–{p.awayPred}
          </div>
          {fin && (
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              FT {m.homeScore}–{m.awayScore}
            </div>
          )}
        </div>
        <div style={{ minWidth: 64, textAlign: "right" }}>
          {fin ? (
            <span className={`pill ${p.points > 0 ? "win" : "locked"}`}>{p.points} pts</span>
          ) : (
            <span className="pill locked">Locked</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="wrap">
      <div style={{ position: "relative" }}>
        <div className="hero-doodle" style={{ top: 0 }}>
          <TrophyDoodle size={92} />
        </div>
        <div className="label">Your game</div>
        <h1 className="page">My predictions</h1>
        <p className="lead">Every pick you've made, how it scored, and what's still locked in.</p>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="n">{me.points}</div>
          <div className="l">Total points</div>
        </div>
        <div className="tile">
          <div className="n">{preds.length}</div>
          <div className="l">Predictions made</div>
        </div>
        <div className="tile">
          <div className="n">{exact}</div>
          <div className="l">Exact scores</div>
        </div>
        <div className="tile">
          <div className="n">{correct}</div>
          <div className="l">Points-scoring picks</div>
        </div>
      </div>

      <div className="note-box">
        🏆 Champion pick:{" "}
        {me.championTeam ? (
          <b style={{ color: "var(--text)" }}>
            {me.championTeam.flag} {me.championTeam.name}
          </b>
        ) : (
          <>
            none yet —{" "}
            <Link href="/" style={{ color: "var(--orange)" }}>
              pick one on the dashboard
            </Link>
          </>
        )}{" "}
        {me.championTeam && <span style={{ color: "var(--muted)" }}>(+15 pts if correct)</span>}
        {fromMatches !== me.points && (
          <span style={{ color: "var(--muted)" }}> · {fromMatches} from matches</span>
        )}
      </div>

      {preds.length === 0 && (
        <div className="note-box">
          You haven't made any predictions yet.{" "}
          <Link href="/matches" style={{ color: "var(--orange)" }}>
            Start predicting →
          </Link>
        </div>
      )}

      {scored.length > 0 && (
        <>
          <h2 className="sec">✅ Scored</h2>
          <div className="tbl-wrap">
            {scored.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      {open.length > 0 && (
        <>
          <h2 className="sec">⏳ Awaiting result</h2>
          <div className="tbl-wrap">
            {open.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
