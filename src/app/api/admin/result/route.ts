import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { scoreMatch, recomputeAllTotals } from "@/lib/scoreEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin: enter / correct a match result, or assign teams to a knockout slot.
 * Body: { matchId, home?, away?, status?, homeTeamId?, awayTeamId? }
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ ok: false, error: "Admins only." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const matchId = Number(body?.matchId);
  if (!Number.isInteger(matchId)) {
    return NextResponse.json({ ok: false, error: "Invalid match." }, { status: 400 });
  }

  const data: any = {};
  if (body?.home !== undefined && body?.home !== null && body?.home !== "")
    data.homeScore = Number(body.home);
  if (body?.away !== undefined && body?.away !== null && body?.away !== "")
    data.awayScore = Number(body.away);
  if (body?.status) data.status = String(body.status);
  if (Number.isInteger(Number(body?.homeTeamId))) data.homeTeamId = Number(body.homeTeamId);
  if (Number.isInteger(Number(body?.awayTeamId))) data.awayTeamId = Number(body.awayTeamId);

  await prisma.match.update({ where: { id: matchId }, data });

  await scoreMatch(matchId);
  await recomputeAllTotals();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  return NextResponse.json({ ok: true, match });
}
