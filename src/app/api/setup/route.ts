import { NextRequest, NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const secret = process.env.SETUP_SECRET;

  // If a secret is configured, require it. Otherwise only allow the very first run.
  if (secret) {
    if (key !== secret) {
      return NextResponse.json({ ok: false, error: "Invalid setup key." }, { status: 401 });
    }
  } else {
    const existing = await prisma.user.count().catch(() => -1);
    if (existing > 0) {
      return NextResponse.json(
        { ok: false, error: "Already initialized. Set SETUP_SECRET to re-run." },
        { status: 401 }
      );
    }
  }

  const reset = req.nextUrl.searchParams.get("reset");
  const resetPasswords = reset === "1" || reset === "true";

  try {
    const counts = await runSeed({ resetPasswords });
    return NextResponse.json({
      ok: true,
      message: resetPasswords ? "Database seeded; passwords reset to default." : "Database seeded.",
      counts,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
