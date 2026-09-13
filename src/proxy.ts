import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { authSecret } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/session";

const PUBLIC = new Set([
  "/entrar",
  "/cadastrar",
  "/recuperar-senha",
  "/redefinir-senha",
]);

function secret() {
  return new TextEncoder().encode(authSecret());
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let authenticated = false;

  if (token && authSecret()) {
    try {
      await jwtVerify(token, secret());
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  const isPublic = PUBLIC.has(pathname);

  if (!authenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (authenticated && (isPublic || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/diario";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
