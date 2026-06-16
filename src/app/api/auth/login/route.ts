import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Enter your name and password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, error: "Wrong name or password." }, { status: 401 });
  }

  await setSession({
    id: user.id,
    username: user.username,
    name: user.name,
    isAdmin: user.isAdmin,
    avatar: user.avatar,
  });

  return NextResponse.json({ ok: true, user: { username: user.username, name: user.name } });
}
