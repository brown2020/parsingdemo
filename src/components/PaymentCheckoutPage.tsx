"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

import { useEffect, useState } from "react";
import { createPaymentIntent } from "@/lib/paymentActions";
import convertToSubcurrency from "@/utils/convertToSubcurrency";
import { ClipLoader } from "react-spinners";

type Props = { amount: number };

export default function PaymentCheckoutPage({ amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function initializePayment() {
      try {
        const secret = await createPaymentIntent(convertToSubcurrency(amount));
        if (ignore) return;
        if (secret) setClientSecret(secret);
      } catch (error) {
        console.warn("Error initializing payment:", error);
        if (ignore) return;
        setErrorMessage("Failed to initialize payment. Please try again.");
      }
    }

    void initializePayment();
    return () => {
      ignore = true;
    };
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Payment failed");
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?amount=${amount}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
      }
    } catch (error) {
      setErrorMessage("Payment validation failed. Please try again.");
      console.warn("Payment validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center max-w-6xl h-36 mx-auto w-full">
        <ClipLoader color="#1d4ed8" size={36} />
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full items-center max-w-6xl mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Buy 10,000 Credits</h1>
        <p className="text-xl text-slate-600">
          Purchase amount:{" "}
          <span className="font-bold text-slate-900">${amount}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 w-full max-w-md">
        {clientSecret && <PaymentElement />}

        {errorMessage && (
          <div className="banner-error mt-4" role="alert">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="btn-secondary w-full mt-4 py-3"
        >
          {!loading ? `Pay $${amount}` : "Processing..."}
        </button>
      </form>
    </main>
  );
}
