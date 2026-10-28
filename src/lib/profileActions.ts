"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb, hasAdminConfig } from "@/firebase/firebaseAdmin";
import { authenticateAction } from "@/utils/serverAuth";
import { INITIAL_CREDITS } from "@/utils/creditPack";
import { STORED_SECRET_FIELDS } from "@/utils/profileFields";

/**
 * Create the profile once with the welcome balance, and delete any
 * provider API keys previously stored on the document.
 * Credits are not rewritten when the profile already exists.
 */
export async function ensureUserProfile() {
  if (
    !hasAdminConfig ||
    typeof adminDb.runTransaction !== "function" ||
    typeof adminAuth.getUser !== "function"
  ) {
    throw new Error("Profile service is not configured");
  }

  const uid = await authenticateAction();

  const user = await adminAuth.getUser(uid);
  const ref = adminDb.doc(`users/${uid}/profile/userData`);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      tx.set(ref, {
        email: user.email ?? "",
        contactEmail: user.email ?? "",
        displayName: user.displayName ?? "",
        photoUrl: user.photoURL ?? "",
        emailVerified: Boolean(user.emailVerified),
        credits: INITIAL_CREDITS,
      });
      return;
    }

    const data = snap.data() ?? {};
    const deletes: Record<string, ReturnType<typeof FieldValue.delete>> = {};
    for (const key of STORED_SECRET_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        deletes[key] = FieldValue.delete();
      }
    }
    if (Object.keys(deletes).length > 0) {
      tx.update(ref, deletes);
    }
  });
}
