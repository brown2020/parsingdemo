"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import useProfileStore from "@/zustand/useProfileStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { validatePaymentIntent } from "@/lib/paymentActions";

type Props = {
  payment_intent: string;
};

export default function PaymentSuccessPage({ payment_intent }: Props) {
  const CREDITS_PER_PURCHASE = 10_000;

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [createdAtMs, setCreatedAtMs] = useState<number | null>(null);

  const addPayment = usePaymentsStore((state) => state.addPayment);
  const checkIfPaymentProcessed = usePaymentsStore(
    (state) => state.checkIfPaymentProcessed
  );
  const addCredits = useProfileStore((state) => state.addCredits);

  const uid = useAuthStore((state) => state.uid);

  useEffect(() => {
    if (!payment_intent) {
      setMessage("No payment intent found");
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        const existing = await checkIfPaymentProcessed(payment_intent);
        if (existing?.status === "succeeded") {
          setMessage("Payment already processed");
          setId(existing.id);
          setAmount(existing.amount);
          setStatus(existing.status);
          setCreatedAtMs(existing.createdAt?.toMillis?.() ?? null);
          return;
        }

        const data = await validatePaymentIntent(payment_intent);

        if (data.status === "succeeded") {
          setMessage("Payment successful");
          setId(data.id);
          setAmount(data.amount);
          setStatus(data.status);
          setCreatedAtMs((data.created ?? 0) * 1000);

          // Add payment to store
          const recorded = await addPayment({
            id: data.id,
            amount: data.amount,
            status: data.status,
          });

          // Add credits to profile
          if (recorded) {
            await addCredits(CREDITS_PER_PURCHASE);
          }
        } else {
          console.error("Payment validation failed:", data.status);
          setMessage("Payment validation failed");
        }
      } catch (error) {
        console.error("Error handling payment success:", error);
        setMessage("Error handling payment success");
      } finally {
        setLoading(false);
      }
    };

    if (uid) handlePaymentSuccess();
  }, [payment_intent, addPayment, addCredits, checkIfPaymentProcessed, uid]);

  return (
    <main className="max-w-6xl w-full mx-auto p-10 text-white text-center border m-10 rounded-md bg-linear-to-tr from-blue-500 to-purple-500">
      {loading ? (
        <div>validating...</div>
      ) : id ? (
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
          <h2 className="text-2xl">You successfully purchased credits</h2>
          <div className="bg-white p-2 rounded-md text-purple-500 mt-5 text-4xl font-bold">
            ${amount / 100}
          </div>
          <div>Uid: {uid}</div>
          <div>Id: {id}</div>
          <div>
            Created:{" "}
            {createdAtMs ? new Date(createdAtMs).toLocaleString() : "N/A"}
          </div>
          <div>Status: {status}</div>
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
