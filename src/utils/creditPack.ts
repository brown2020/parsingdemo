export const CREDIT_PACK_CENTS = 9999;
export const CREDIT_PACK_CREDITS = 10_000;
export const CREDIT_PACK_CURRENCY = "usd";
export const CREDIT_PACK_PURPOSE = "credit_pack";
export const INITIAL_CREDITS = 1000;
export const ANALYSIS_CREDIT_COST = 1;
export const MAX_ANALYSIS_DOCUMENTS = 10;
export const MAX_ANALYSIS_PDF_BYTES = 4 * 1024 * 1024;

const UID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const PAYMENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export type CreditPackIntent = {
  id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, string> | null;
};

export type CreditPackDecision =
  | { ok: true; uid: string; id: string; amount: number }
  | { ok: false; reason: string };

/** Accept only this app's fixed credit pack after Stripe marks it succeeded. */
export function assessCreditPackPayment(intent: CreditPackIntent): CreditPackDecision {
  if (!intent.id || !PAYMENT_ID_PATTERN.test(intent.id)) {
    return { ok: false, reason: "id" };
  }
  if (intent.status !== "succeeded") {
    return { ok: false, reason: "status" };
  }
  if (intent.currency !== CREDIT_PACK_CURRENCY) {
    return { ok: false, reason: "currency" };
  }
  if (intent.amount !== CREDIT_PACK_CENTS) {
    return { ok: false, reason: "amount" };
  }
  if (intent.metadata?.purpose !== CREDIT_PACK_PURPOSE) {
    return { ok: false, reason: "purpose" };
  }
  const uid = intent.metadata.uid ?? "";
  if (!UID_PATTERN.test(uid)) {
    return { ok: false, reason: "uid" };
  }
  return { ok: true, uid, id: intent.id, amount: intent.amount };
}
