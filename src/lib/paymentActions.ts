"use server";

import Stripe from "stripe";
import { authenticateAction } from "@/utils/serverAuth";
import { hasAdminConfig } from "@/firebase/firebaseAdmin";
import {
  CREDIT_PACK_CENTS,
  CREDIT_PACK_CURRENCY,
  CREDIT_PACK_PURPOSE,
} from "@/utils/creditPack";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Payments are not configured");
  return new Stripe(key);
}

export async function createPaymentIntent() {
  const uid = await authenticateAction();
  if (!process.env.STRIPE_WEBHOOK_SECRET?.trim() || !hasAdminConfig) {
    throw new Error("Payments are not configured");
  }

  const stripe = getStripe();
  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME || "credits";

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: CREDIT_PACK_CENTS,
      currency: CREDIT_PACK_CURRENCY,
      metadata: {
        product,
        uid,
        purpose: CREDIT_PACK_PURPOSE,
      },
      description: `Payment for product ${product}`,
    });
    return paymentIntent.client_secret;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
}
