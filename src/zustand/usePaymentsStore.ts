import { create } from "zustand";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { db } from "@/firebase/firebaseClient";

export type PaymentType = {
  id: string;
  amount: number;
  createdAt: Timestamp | null;
  status: string;
};

interface PaymentsStoreState {
  payments: PaymentType[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  fetchPayments: () => Promise<void>;
  addPayment: (payment: Omit<PaymentType, "createdAt">) => Promise<boolean>;
  checkIfPaymentProcessed: (paymentId: string) => Promise<PaymentType | null>;
}

export const usePaymentsStore = create<PaymentsStoreState>((set) => ({
  payments: [],
  paymentsLoading: false,
  paymentsError: null,

  fetchPayments: async () => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      return;
    }

    set({ paymentsLoading: true });

    try {
      const q = query(collection(db, "users", uid, "payments"));
      const querySnapshot = await getDocs(q);
      const payments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().amount,
        createdAt: doc.data().createdAt ?? null,
        status: doc.data().status,
      }));

      // Sort payments by createdAt with newest at the top
      payments.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );

      set({ payments, paymentsLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error fetching payments:", errorMessage);
      set({ paymentsError: errorMessage, paymentsLoading: false });
    }
  },

  addPayment: async (payment) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) {
      return false;
    }

    set({ paymentsLoading: true });

    try {
      const paymentRef = doc(db, "users", uid, "payments", payment.id);
      const existing = await getDoc(paymentRef);
      if (existing.exists()) {
        set({ paymentsLoading: false });
        toast.error("Payment already recorded.");
        return false;
      }

      const createdAt = Timestamp.now();
      await setDoc(paymentRef, {
        amount: payment.amount,
        createdAt,
        status: payment.status,
      });

      const newPayment: PaymentType = {
        id: payment.id,
        amount: payment.amount,
        createdAt,
        status: payment.status,
      };

      set((state) => {
        const updatedPayments = [...state.payments, newPayment];

        // Sort payments by createdAt with newest at the top
        updatedPayments.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );

        return { payments: updatedPayments, paymentsLoading: false };
      });

      toast.success("Payment added successfully.");
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error adding payment:", errorMessage);
      set({ paymentsError: errorMessage, paymentsLoading: false });
      return false;
    }
  },

  checkIfPaymentProcessed: async (paymentId) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return null;

    const paymentRef = doc(db, "users", uid, "payments", paymentId);
    const snap = await getDoc(paymentRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: snap.id,
      amount: data.amount,
      createdAt: data.createdAt ?? null,
      status: data.status,
    } as PaymentType;
  },
}));
