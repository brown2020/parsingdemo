"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";

type Props = {
  showTitle?: boolean;
};

export default function PaymentsPage({ showTitle = true }: Props) {
  const uid = useAuthStore((state) => state.uid);
  const { payments, paymentsLoading, paymentsError, fetchPayments } =
    usePaymentsStore();

  useEffect(() => {
    if (uid) {
      fetchPayments();
    }
  }, [uid, fetchPayments]);

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-4">
      {showTitle && <h2 className="text-2xl font-bold">Payments</h2>}

      {paymentsLoading && (
        <div className="flex items-center gap-2 text-slate-500">
          <ClipLoader size={16} color="#64748b" />
          <span>Loading payments...</span>
        </div>
      )}
      {paymentsError && (
        <div className="banner-error">Error: {paymentsError}</div>
      )}
      {!paymentsLoading && !paymentsError && (
        <div className="flex flex-col gap-2">
          {payments.length === 0 ? (
            <p className="text-slate-500">No payments yet.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="card p-4">
                <div className="text-sm text-slate-500">ID: {payment.id}</div>
                <div className="text-lg font-semibold">
                  ${payment.amount / 100}
                </div>
                <div className="text-sm text-slate-600">
                  {payment.createdAt
                    ? payment.createdAt.toDate().toLocaleString()
                    : "N/A"}
                </div>
                <div className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      payment.status === "succeeded"
                        ? "text-green-600"
                        : "text-slate-600"
                    }
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
