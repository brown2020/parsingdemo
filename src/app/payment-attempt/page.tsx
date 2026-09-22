"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import PaymentCheckoutPage from "@/components/PaymentCheckoutPage";
import convertToSubcurrency from "@/utils/convertToSubcurrency";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY?.trim();
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function PaymentAttempt() {
  const amount = 99.99;

  if (!stripePromise) {
    return (
      <AuthGuard>
        <div className="mx-auto flex max-w-md flex-col gap-3 p-6 text-center">
          <h1 className="text-2xl font-semibold">Payments unavailable</h1>
          <p className="text-sm text-slate-600">
            Stripe is not configured in this environment. Credit purchase is
            disabled until NEXT_PUBLIC_STRIPE_KEY is set.
          </p>
          <Link href="/account" className="btn-primary">
            Back to account
          </Link>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: convertToSubcurrency(amount),
          currency: "usd",
        }}
      >
        <PaymentCheckoutPage amount={amount} />
      </Elements>
    </AuthGuard>
  );
}
