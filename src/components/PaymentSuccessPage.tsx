"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  payment_intent: string;
};

const USD_FMT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function PaymentSuccessPage({ payment_intent }: Props) {
  const [message, setMessage] = useState(
    payment_intent
      ? "Confirming your payment…"
      : "No payment intent found"
  );
  const [loading, setLoading] = useState(!!payment_intent);
  const [amount, setAmount] = useState(0);
  const [verified, setVerified] = useState(false);

  const checkIfPaymentProcessed = usePaymentsStore(
    (state) => state.checkIfPaymentProcessed
  );
  const uid = useAuthStore((state) => state.uid);

  useEffect(() => {
    if (!payment_intent || !uid) return;
    let ignore = false;
    let attempts = 0;

    const tick = async () => {
      if (ignore || attempts >= 5) return;
      attempts += 1;
      try {
        const existing = await checkIfPaymentProcessed(payment_intent);
        if (ignore) return;
        if (existing?.status === "succeeded") {
          ignore = true;
          setVerified(true);
          setAmount(existing.amount);
          setMessage("Payment verified. Credits have been added to your account.");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn("Error checking payment:", error);
      }
      if (ignore) return;
      if (attempts >= 5) {
        setMessage(
          "Payment submitted. Credits appear after the payment is verified."
        );
        setLoading(false);
      }
    };

    const timer = setInterval(() => {
      void tick();
    }, 1500);
    void tick();

    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [payment_intent, checkIfPaymentProcessed, uid]);

  return (
    <main className="max-w-6xl w-full mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-blue-700 to-purple-700">
      {loading ? (
        <div>validating...</div>
      ) : verified ? (
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
          <h2 className="text-2xl">You successfully purchased credits</h2>
          <div className="bg-white p-2 rounded-md text-purple-700 mt-5 text-4xl font-bold">
            {USD_FMT.format(amount / 100)}
          </div>
          {message ? <div className="mt-2">{message}</div> : null}
        </div>
      ) : (
        <div className="mb-10">{message}</div>
      )}

      <Link href="/account" className="btn-primary">
        View Account
      </Link>
    </main>
  );
}
