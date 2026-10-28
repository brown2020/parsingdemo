export const CLIENT_PROFILE_FIELDS = [
  "email",
  "contactEmail",
  "displayName",
  "photoUrl",
  "emailVerified",
] as const;

export const STORED_SECRET_FIELDS = [
  "openai_api_key",
  "anthropic_api_key",
  "google_gen_ai_api_key",
  "mistral_api_key",
  "fireworks_api_key",
] as const;

export type ClientProfileField = (typeof CLIENT_PROFILE_FIELDS)[number];

export type ClientProfileUpdate = Partial<{
  email: string;
  contactEmail: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
}>;

/** Keep only identity fields a browser is allowed to write. */
export function pickClientProfileFields(
  input: Record<string, unknown>
): ClientProfileUpdate {
  const update: ClientProfileUpdate = {};
  for (const field of CLIENT_PROFILE_FIELDS) {
    if (!(field in input)) continue;
    const value = input[field];
    if (field === "emailVerified") {
      if (typeof value === "boolean") update.emailVerified = value;
      continue;
    }
    if (typeof value === "string") {
      update[field] = value;
    }
  }
  return update;
}
