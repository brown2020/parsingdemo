import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  uid: string;
  firebaseUid: string;
  authEmail: string;
  authDisplayName: string;
  authPhotoUrl: string;
  authEmailVerified: boolean;
  authReady: boolean;
}

interface AuthActions {
  setAuthDetails: (details: Partial<AuthState>) => void;
  clearAuthDetails: () => void;
}

type AuthStore = AuthState & AuthActions;

const defaultAuthState: AuthState = {
  uid: "",
  firebaseUid: "",
  authEmail: "",
  authDisplayName: "",
  authPhotoUrl: "",
  authEmailVerified: false,
  authReady: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...defaultAuthState,

      setAuthDetails: (details: Partial<AuthState>) =>
        set((state) => ({ ...state, ...details })),

      clearAuthDetails: () => set({ ...defaultAuthState }),
    }),
    {
      name: "auth-storage",
      // Only persist non-sensitive data
      partialize: (state) => ({
        uid: state.uid,
        firebaseUid: state.firebaseUid,
        authEmail: state.authEmail,
        authDisplayName: state.authDisplayName,
        authPhotoUrl: state.authPhotoUrl,
        authEmailVerified: state.authEmailVerified,
        // Don't persist authReady - should be set fresh on each session
      }),
    }
  )
);
