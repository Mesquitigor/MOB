import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { authSecret } from "@/lib/env";

export const SESSION_COOKIE = "mob_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

function secret() {
  const value = authSecret();
  if (!value) {
    throw new Error("AUTH_SECRET ausente no ambiente.");
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(user: SessionUser, remember: boolean) {
  return new SignJWT({ name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(remember ? "30d" : "24h")
    .sign(secret());
}

export async function readSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.name !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, remember: boolean) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}
