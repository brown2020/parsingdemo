import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isProtectedPathname,
  SESSION_COOKIE_NAME,
} from "@/utils/authConstants";

/**
 * Next.js 16: `proxy.ts` replaces `middleware.ts`.
 *
 * Soft edge gate: cookie presence only. Cryptographic verification happens in
 * Server Actions via `authenticateAction()` (Firebase Admin verifyIdToken).
 * AuthGuard remains a client UX fallback when Firebase client config is present.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedPathname(pathname)) {
    const authCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!authCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
