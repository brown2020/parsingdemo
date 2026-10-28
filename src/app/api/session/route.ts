import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, hasAdminConfig } from "@/firebase/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/utils/authConstants";
import { SESSION_MAX_AGE_SECONDS, sessionCookieOptions } from "@/utils/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  if (!hasAdminConfig || typeof adminAuth.createSessionCookie !== "function") {
    return jsonError("Authentication is not configured", 503);
  }

  let idToken = "";
  try {
    const body = (await req.json()) as { idToken?: unknown };
    if (typeof body.idToken === "string") idToken = body.idToken;
  } catch {
    return jsonError("Invalid request", 400);
  }

  if (idToken.length < 20 || idToken.length > 20_000) {
    return jsonError("Invalid request", 400);
  }

  try {
    const session = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });
    const jar = await cookies();
    jar.set(
      SESSION_COOKIE_NAME,
      session,
      sessionCookieOptions(process.env.NODE_ENV === "production")
    );
    return NextResponse.json({ ok: true });
  } catch {
    console.error("Session cookie creation failed");
    return jsonError("Authentication required", 401);
  }
}

export async function DELETE() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
