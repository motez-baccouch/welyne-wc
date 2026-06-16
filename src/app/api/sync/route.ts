import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { syncFromFootballData } from "@/lib/footballData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorized(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (process.env.SETUP_SECRET && key === process.env.SETUP_SECRET) return true;
  // Vercel Cron sends this header automatically when CRON_SECRET is configured.
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const session = await getSession();
  return Boolean(session?.isAdmin);
}

async function handle(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const result = await syncFromFootballData();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
