/**
 * Server-side authentication for Server Actions and Route Handlers.
 * Verifies the Firebase ID token from the auth cookie.
 */

import { cookies } from "next/headers";
import { adminAuth, hasAdminConfig } from "@/firebase/firebaseAdmin";

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Verifies the auth cookie and returns the authenticated user's UID.
 * Throws AuthenticationError if not authenticated.
 */
export async function authenticateAction(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    throw new AuthenticationError("Authentication required. Please sign in.");
  }

  if (!hasAdminConfig || typeof adminAuth.verifyIdToken !== "function") {
    throw new AuthenticationError(
      "Server authentication is not configured in this environment."
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new AuthenticationError(
      "Your session has expired. Please sign in again."
    );
  }
}
