import { FieldValue } from "firebase-admin/firestore";
import { adminDb, hasAdminConfig } from "@/firebase/firebaseAdmin";
import {
  CREDIT_PACK_CREDITS,
  INITIAL_CREDITS,
  assessCreditPackPayment,
  type CreditPackIntent,
} from "@/utils/creditPack";

function requireAdmin() {
  if (!hasAdminConfig || typeof adminDb.runTransaction !== "function") {
    throw new Error("Billing is not configured");
  }
}

function readCredits(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function chargeCredits(uid: string, amount: number) {
  if (amount <= 0) return;
  requireAdmin();
  const ref = adminDb.doc(`users/${uid}/profile/userData`);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? readCredits(snap.get("credits")) : 0;
    if (!snap.exists || current < amount) {
      throw new Error("Not enough credits");
    }
    tx.update(ref, { credits: current - amount });
  });
}

export async function refundCredits(uid: string, amount: number) {
  if (amount <= 0) return;
  requireAdmin();
  const ref = adminDb.doc(`users/${uid}/profile/userData`);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const current = readCredits(snap.get("credits"));
    tx.update(ref, { credits: current + amount });
  });
}

export async function fulfillCreditPack(
  intent: CreditPackIntent
): Promise<"granted" | "duplicate" | "ignored"> {
  const decision = assessCreditPackPayment(intent);
  if (!decision.ok) return "ignored";
  requireAdmin();

  const paymentRef = adminDb.doc(`users/${decision.uid}/payments/${decision.id}`);
  const profileRef = adminDb.doc(`users/${decision.uid}/profile/userData`);
  let result: "granted" | "duplicate" = "granted";

  await adminDb.runTransaction(async (tx) => {
    const payment = await tx.get(paymentRef);
    if (payment.exists && payment.get("status") === "succeeded") {
      result = "duplicate";
      return;
    }

    const profile = await tx.get(profileRef);
    const current = profile.exists
      ? readCredits(profile.get("credits"))
      : INITIAL_CREDITS;
    const credits = current + CREDIT_PACK_CREDITS;

    if (profile.exists) {
      tx.update(profileRef, { credits });
    } else {
      tx.set(profileRef, {
        email: "",
        contactEmail: "",
        displayName: "",
        photoUrl: "",
        emailVerified: false,
        credits,
      });
    }

    tx.set(paymentRef, {
      amount: decision.amount,
      status: "succeeded",
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return result;
}
