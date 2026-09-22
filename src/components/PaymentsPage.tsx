"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { usePaymentsStore } from "@/zustand/usePaymentsStore";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

type Props = {
  showTitle?: boolean;
};

type Row = {
  id: string;
  dollars: string;
  when: string;
  status: string;
};

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function PaymentsPage({ showTitle = true }: Props) {
  const uid = useAuthStore((state) => state.uid);
  const { payments, paymentsLoading, paymentsError, fetchPayments } =
    usePaymentsStore();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (uid) {
      fetchPayments();
    }
  }, [uid, fetchPayments]);

  useEffect(() => {
    // Format outside render (Doctor: no-locale-format-in-render).
    setRows(
      payments.map((payment) => ({
        id: payment.id,
        dollars: (payment.amount / 100).toFixed(2),
        when: payment.createdAt
          ? DATE_FMT.format(payment.createdAt.toDate())
          : "N/A",
        status: payment.status,
      }))
    );
  }, [payments]);

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
        <div className="banner-error" role="alert">
          Error: {paymentsError}
        </div>
      )}
      {!paymentsLoading && !paymentsError && (
        <div className="flex flex-col gap-2">
          {rows.length === 0 ? (
            <p className="text-slate-500">No payments yet.</p>
          ) : (
            rows.map((payment) => (
              <div key={payment.id} className="card p-4">
                <div className="text-sm text-slate-500">ID: {payment.id}</div>
                <div className="text-lg font-semibold">${payment.dollars}</div>
                <div className="text-sm text-slate-600">{payment.when}</div>
                <div className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      payment.status === "succeeded"
                        ? "text-green-700"
                        : "text-slate-700"
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
