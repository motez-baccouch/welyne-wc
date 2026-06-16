import { prisma } from "./prisma";
import { scorePrediction, POINTS } from "./scoring";

/** Recompute prediction points for one finished match. */
export async function scoreMatch(matchId: number) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;
  if (match.status !== "FINISHED" || match.homeScore == null || match.awayScore == null) {
    // not finished — clear any awarded points
    await prisma.prediction.updateMany({
      where: { matchId },
      data: { points: 0, scored: false },
    });
    return;
  }

  const preds = await prisma.prediction.findMany({ where: { matchId } });
  for (const p of preds) {
    const pts = scorePrediction(
      p.homePred,
      p.awayPred,
      match.homeScore,
      match.awayScore,
      match.stage
    );
    await prisma.prediction.update({
      where: { id: p.id },
      data: { points: pts, scored: true },
    });
  }
}

/** Recompute every user's total points (match predictions + champion bonus). */
export async function recomputeAllTotals() {
  const users = await prisma.user.findMany({
    include: { predictions: true, championTeam: true },
  });

  // Determine the actual champion if the final is finished.
  const final = await prisma.match.findUnique({ where: { code: "FIN" } });
  let championTeamId: number | null = null;
  if (final && final.status === "FINISHED" && final.homeScore != null && final.awayScore != null) {
    championTeamId =
      final.homeScore > final.awayScore ? final.homeTeamId : final.awayTeamId;
  }

  for (const u of users) {
    let total = u.predictions.reduce((s, p) => s + p.points, 0);
    if (championTeamId && u.championTeamId === championTeamId) {
      total += POINTS.CHAMPION_BONUS;
    }
    await prisma.user.update({ where: { id: u.id }, data: { points: total } });
  }
}

/** Full pass: score all finished matches then totals. */
export async function rescoreEverything() {
  const finished = await prisma.match.findMany({ where: { status: "FINISHED" } });
  for (const m of finished) await scoreMatch(m.id);
  await recomputeAllTotals();
}
