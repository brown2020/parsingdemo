export const SESSION_MAX_AGE_SECONDS = 5 * 24 * 60 * 60;

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true as const,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
