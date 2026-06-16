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

  await prisma.user.update({ where: { id: session.id }, data: { championTeamId: teamId } });
  return NextResponse.json({ ok: true, championTeamId: teamId });
}
