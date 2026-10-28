import { create } from "zustand";
import {
  collection,
  doc,
  getDoc,
  query,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
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
