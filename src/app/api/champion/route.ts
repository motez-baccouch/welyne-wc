import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const teamId = Number(body?.teamId);
  if (!Number.isInteger(teamId)) {
    return NextResponse.json({ ok: false, error: "Pick a team." }, { status: 400 });
  }

  // Lock the champion pick once the final has finished.
  const final = await prisma.match.findUnique({ where: { code: "FIN" } });
  if (final && final.status === "FINISHED") {
    return NextResponse.json({ ok: false, error: "Final is over — pick is locked." }, { status: 403 });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ ok: false, error: "Team not found." }, { status: 404 });

  const me = await prisma.user.findUnique({ where: { id: session.id } });
  if (!me) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const MAX_CHANGES = 2;
  const isInitial = me.championTeamId == null;
  const isSameTeam = me.championTeamId === teamId;

  // Picking the same team again is a no-op (doesn't burn a change).
  if (isSameTeam) {
    return NextResponse.json({ ok: true, championTeamId: teamId, changesLeft: MAX_CHANGES - me.championChanges });
  }

  // Changing an existing pick costs one of the two allowed changes.
  if (!isInitial && me.championChanges >= MAX_CHANGES) {
    return NextResponse.json(
      { ok: false, error: "You've used both champion changes — your pick is locked.", changesLeft: 0 },
      { status: 403 }
    );
  }

  const nextChanges = isInitial ? me.championChanges : me.championChanges + 1;
  await prisma.user.update({
    where: { id: session.id },
    data: { championTeamId: teamId, championChanges: nextChanges },
  });
  return NextResponse.json({
    ok: true,
    championTeamId: teamId,
    changesLeft: MAX_CHANGES - nextChanges,
  });
}
