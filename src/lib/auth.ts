import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export { hashPassword, verifyPassword } from "./password";

const COOKIE = "wc_session";
const ALG = "HS256";

function secret() {
  const s = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  return new TextEncoder().encode(s);
}

export type SessionUser = {
  id: number;
  username: string;
  name: string;
  isAdmin: boolean;
  avatar?: string | null;
};

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    uid: user.id,
    username: user.username,
    name: user.name,
    isAdmin: user.isAdmin,
    avatar: user.avatar ?? null,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function setSession(user: SessionUser) {
  const token = await createSessionToken(user);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: payload.uid as number,
      username: payload.username as string,
      name: payload.name as string,
      isAdmin: Boolean(payload.isAdmin),
      avatar: (payload.avatar as string | null) ?? null,
    };
  } catch {
    return null;
  }
}
