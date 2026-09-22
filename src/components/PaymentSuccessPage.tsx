"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import useProfileStore from "@/zustand/useProfileStore";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { validatePaymentIntent } from "@/lib/paymentActions";

type Props = {
  payment_intent: string;
};

const USD_FMT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const WHEN_FMT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatUsd(cents: number) {
  return USD_FMT.format(cents / 100);
}

function formatWhen(ms: number | null) {
  if (!ms) return "N/A";
  return WHEN_FMT.format(new Date(ms));
}

export default function PaymentSuccessPage({ payment_intent }: Props) {
  const CREDITS_PER_PURCHASE = 10_000;

  const [message, setMessage] = useState(
    payment_intent ? "" : "No payment intent found"
  );
  const [loading, setLoading] = useState(!!payment_intent);
  const [id, setId] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [createdAtMs, setCreatedAtMs] = useState<number | null>(null);

  const processingRef = useRef(false);
  const processedPaymentRef = useRef<string | null>(null);

  const addPayment = usePaymentsStore((state) => state.addPayment);
  const checkIfPaymentProcessed = usePaymentsStore(
    (state) => state.checkIfPaymentProcessed
  );
  const addCredits = useProfileStore((state) => state.addCredits);

  const uid = useAuthStore((state) => state.uid);

  useEffect(() => {
    if (!payment_intent || !uid) return;
    if (processingRef.current || processedPaymentRef.current === payment_intent) {
      return;
    }

    let ignore = false;
    processingRef.current = true;

    const handlePaymentSuccess = async () => {
      try {
        const existing = await checkIfPaymentProcessed(payment_intent);
        if (ignore) return;
        if (existing?.status === "succeeded") {
          setMessage("Payment already processed");
          setId(existing.id);
          setAmount(existing.amount);
          setStatus(existing.status);
          setCreatedAtMs(existing.createdAt?.toMillis?.() ?? null);
          processedPaymentRef.current = payment_intent;
          return;
        }

        const data = await validatePaymentIntent(payment_intent);
        if (ignore) return;

        if (data.status === "succeeded") {
          setMessage("Payment successful");
          setId(data.id);
          setAmount(data.amount);
          setStatus(data.status);
          setCreatedAtMs((data.created ?? 0) * 1000);

          const recorded = await addPayment({
            id: data.id,
            amount: data.amount,
            status: data.status,
          });
          if (ignore) return;

          if (recorded) {
            await addCredits(CREDITS_PER_PURCHASE);
          }
          if (ignore) return;

          processedPaymentRef.current = payment_intent;
        } else {
          console.warn("Payment validation failed:", data.status);
          setMessage("Payment validation failed");
        }
      } catch (error) {
        console.warn("Error handling payment success:", error);
        if (ignore) return;
        setMessage("Error handling payment success");
      } finally {
        if (!ignore) setLoading(false);
        processingRef.current = false;
      }
    };

    void handlePaymentSuccess();

    return () => {
      ignore = true;
    };
  }, [payment_intent, addPayment, addCredits, checkIfPaymentProcessed, uid]);

  return (
    <main className="max-w-6xl w-full mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-blue-700 to-purple-700">
      {loading ? (
        <div>validating...</div>
      ) : id ? (
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
          <h2 className="text-2xl">You successfully purchased credits</h2>
          <div className="bg-white p-2 rounded-md text-purple-700 mt-5 text-4xl font-bold">
            {formatUsd(amount)}
          </div>
          <div>Uid: {uid}</div>
          <div>Id: {id}</div>
          <div>Created: {formatWhen(createdAtMs)}</div>
          <div>Status: {status}</div>
          {message ? <div className="mt-2">{message}</div> : null}
        </div>
      ) : (
        <div>{message}</div>
      )}

      <Link href="/account" className="btn-primary">
        View Account
      </Link>
    </main>
  );
}
