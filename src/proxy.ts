import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";

const PUBLIC = new Set([
  "/entrar",
  "/cadastrar",
  "/recuperar-senha",
  "/redefinir-senha",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;
  const authenticated = Boolean(session);
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
