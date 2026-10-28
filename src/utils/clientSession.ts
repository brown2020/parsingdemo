import { getIdToken, type User } from "firebase/auth";

const MINT_INTERVAL_MS = 60 * 60 * 1000;
const FRESH_TOKEN_MS = 4 * 60 * 1000;

let lastMint = 0;
let inFlight: Promise<void> | null = null;

export function resetSessionMint() {
  lastMint = 0;
}

export async function clearPublishedSession() {
  resetSessionMint();
  await fetch("/api/session", { method: "DELETE" });
}

async function publishSession(idToken: string) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    throw new Error("Could not start session");
  }
}

/**
 * Exchange a fresh Firebase ID token for an httpOnly session cookie.
 * Throttled so token listeners cannot mint in a loop.
 */
export async function mintSession(user: User, options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && now - lastMint < MINT_INTERVAL_MS) return;
  if (inFlight) return inFlight;

  const started = now;
  inFlight = (async () => {
    const result = await user.getIdTokenResult();
    const issued = Date.parse(result.issuedAtTime);
    const fresh = Number.isFinite(issued) && Date.now() - issued < FRESH_TOKEN_MS;
    const idToken = fresh && !options?.force ? result.token : await getIdToken(user, true);
    await publishSession(idToken);
    lastMint = started;
  })().finally(() => {
    inFlight = null;
  });

  try {
    await inFlight;
  } catch (error) {
    lastMint = 0;
    throw error;
  }
}
