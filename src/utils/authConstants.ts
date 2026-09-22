/** Soft edge gate + Auth UX route helpers (cookie presence only). */

export const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";

const PROTECTED_PREFIXES = [
  "/documents",
  "/account",
  "/payments",
  "/payment-attempt",
  "/payment-success",
];

export function isProtectedPathname(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
