import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrophyDoodle } from "@/components/Doodles";
import ChangePassword from "@/components/ChangePassword";
import { getT } from "@/lib/i18n.server";
import { tr, Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function fmt(d: Date, lang: Lang) {
  return new Date(d).toLocaleString(lang === "fr" ? "fr-FR" : undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Tunis",
  });
}

export default async function MePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { lang, t } = getT();

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
            <span>{m.homeTeam ? `${m.homeTeam.flag} ${m.homeTeam.name}` : m.homePlaceholder}</span>
            <span style={{ color: "var(--muted)" }}>vs</span>
            <span>{m.awayTeam ? `${m.awayTeam.flag} ${m.awayTeam.name}` : m.awayPlaceholder}</span>
          </div>
          <div className="ro" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
            {tr(lang, `stage.${m.stage}`)}
            {m.groupName ? ` ${m.groupName}` : ""} · {fmt(m.kickoff, lang)}
          </div>
        </div>
        <div style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".1em", color: "var(--muted)" }}>
            {t("me.pick")}
          </div>
          <div style={{ fontWeight: 800 }}>
            {p.homePred}–{p.awayPred}
          </div>
          {fin && (
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {t("me.ft", { h: m.homeScore ?? "", a: m.awayScore ?? "" })}
            </div>
          )}
        </div>
        <div style={{ minWidth: 64, textAlign: "right" }}>
          {fin ? (
            <span className={`pill ${p.points > 0 ? "win" : "locked"}`}>{t("me.pts", { n: p.points })}</span>
          ) : (
            <span className="pill locked">{t("mc.locked")}</span>
          )}
        </div>
      </div>
    );
  }

  const [siBefore, siRest] = tr(lang, "me.signedinas").split("{u}");
  const siAfter = (siRest ?? "").replace("{name}", me.name);

  return (
    <main className="wrap">
      <div style={{ position: "relative" }}>
        <div className="hero-doodle" style={{ top: 0 }}>
          <TrophyDoodle size={92} />
        </div>
        <div className="label">{t("me.eyebrow")}</div>
        <h1 className="page">{t("me.title")}</h1>
        <p className="lead">{t("me.lead")}</p>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="n">{me.points}</div>
          <div className="l">{t("me.totalpoints")}</div>
        </div>
        <div className="tile">
          <div className="n">{preds.length}</div>
          <div className="l">{t("me.predsmade")}</div>
        </div>
        <div className="tile">
          <div className="n">{exact}</div>
          <div className="l">{t("me.exactscores")}</div>
        </div>
        <div className="tile">
          <div className="n">{correct}</div>
          <div className="l">{t("me.scoringpicks")}</div>
        </div>
      </div>

      <div className="note-box">
        {t("me.champ")}{" "}
        {me.championTeam ? (
          <b style={{ color: "var(--text)" }}>
            {me.championTeam.flag} {me.championTeam.name}
          </b>
        ) : (
          <>
            {t("me.nonepick")}
            <Link href="/" style={{ color: "var(--orange)" }}>
              {t("me.pickone")}
            </Link>
          </>
        )}{" "}
        {me.championTeam && <span style={{ color: "var(--muted)" }}>{t("me.ifcorrect")}</span>}
        {fromMatches !== me.points && (
          <span style={{ color: "var(--muted)" }}> · {t("me.frommatches", { n: fromMatches })}</span>
        )}
      </div>

      {preds.length === 0 && (
        <div className="note-box">
          {t("me.noneyet")}
          <Link href="/matches" style={{ color: "var(--orange)" }}>
            {t("me.startpredicting")}
          </Link>
        </div>
      )}

      {scored.length > 0 && (
        <>
          <h2 className="sec">{t("me.scored")}</h2>
          <div className="tbl-wrap">
            {scored.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      {open.length > 0 && (
        <>
          <h2 className="sec">{t("me.awaiting")}</h2>
          <div className="tbl-wrap">
            {open.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      <h2 className="sec">{t("me.account")}</h2>
      <div className="note-box">
        {siBefore}
        <b style={{ color: "var(--text)" }}>{me.username}</b>
        {siAfter}
        <div style={{ marginTop: 6 }}>
          <ChangePassword lang={lang} />
        </div>
      </div>
    </main>
  );
}
