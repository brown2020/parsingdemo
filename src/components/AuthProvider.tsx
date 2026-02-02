"use client";

import { auth } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthDetails({
          uid: user.uid,
          firebaseUid: user.uid,
          authEmail: user.email || "",
          authDisplayName: user.displayName || "",
          authPhotoUrl: user.photoURL || "",
          authEmailVerified: user.emailVerified,
          authReady: true,
        });
      } else {
        // Clear auth details but mark auth as ready (we know user is signed out)
        clearAuthDetails();
        setAuthDetails({ authReady: true });
      }
    });

    return () => unsubscribe();
  }, [setAuthDetails, clearAuthDetails]);

  return <>{children}</>;
}
