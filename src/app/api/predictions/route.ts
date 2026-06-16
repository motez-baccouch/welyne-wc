import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const matchId = Number(body?.matchId);
  const home = Number(body?.home);
  const away = Number(body?.away);

  if (!Number.isInteger(matchId) || !Number.isInteger(home) || !Number.isInteger(away)) {
    return NextResponse.json({ ok: false, error: "Invalid prediction." }, { status: 400 });
  }
  if (home < 0 || away < 0 || home > 30 || away > 30) {
    return NextResponse.json({ ok: false, error: "Scores must be between 0 and 30." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ ok: false, error: "Match not found." }, { status: 404 });

  // Lock once kickoff has passed or the match is live/finished.
  const locked = match.status !== "SCHEDULED" || new Date(match.kickoff).getTime() <= Date.now();
  if (locked) {
    return NextResponse.json({ ok: false, error: "This match is locked." }, { status: 403 });
  }
  // Can't predict a knockout match until both teams are known.
  if (match.homeTeamId == null || match.awayTeamId == null) {
    return NextResponse.json({ ok: false, error: "Teams not decided yet." }, { status: 403 });
  }

  const saved = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.id, matchId } },
    update: { homePred: home, awayPred: away },
    create: { userId: session.id, matchId, homePred: home, awayPred: away },
  });

  return NextResponse.json({ ok: true, prediction: { home: saved.homePred, away: saved.awayPred } });
}
