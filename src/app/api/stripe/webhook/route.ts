import { NextResponse } from "next/server";
import Stripe from "stripe";
import { hasAdminConfig } from "@/firebase/firebaseAdmin";
import { fulfillCreditPack } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Stripe credit fulfillment. When STRIPE_WEBHOOK_SECRET is unset this returns
 * 503 and grants nothing. Checkout is also disabled in that case.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !hasAdminConfig) {
    return jsonError("Webhook is not configured", 503);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return jsonError("Webhook is not configured", 503);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return jsonError("Invalid signature", 400);
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = new Stripe(stripeKey).webhooks.constructEvent(body, signature, secret);
  } catch {
    console.error("Stripe webhook signature failed");
    return jsonError("Invalid signature", 400);
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true });
  }

  const intent = event.data.object;
  try {
    const result = await fulfillCreditPack({
      id: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      metadata: intent.metadata,
    });
    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error("Stripe webhook fulfillment failed", error);
    return jsonError("Fulfillment failed", 500);
  }
}
