import { NextResponse } from "next/server";

/**
 * Next.js 16: `proxy.ts` replaces `middleware.ts`.
 *
 * Firebase Auth uses client-side authentication, so we can't check auth state
 * in middleware (Firebase SDK doesn't work in edge runtime).
 *
 * Protected routes are handled client-side with the AuthGuard component.
 * This middleware just passes through all requests.
 */
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
