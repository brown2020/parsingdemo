"use client";

import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import { onIdTokenChanged } from "firebase/auth";
import { clearPublishedSession, mintSession, resetSessionMint } from "@/utils/clientSession";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  useEffect(() => {
    if (!hasClientConfig || !auth) {
      // CI / missing secrets: mark auth ready so pages can render without hang.
      setAuthDetails({ authReady: true });
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, (user) => {
      void (async () => {
        if (user) {
          try {
            await mintSession(user);
          } catch (error) {
            console.warn("Session refresh failed", error);
          }
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
          resetSessionMint();
          try {
            await clearPublishedSession();
          } catch (error) {
            console.warn("Session clear failed", error);
          }
          clearAuthDetails();
          setAuthDetails({ authReady: true });
        }
      })();
    });

    return () => unsubscribe();
  }, [setAuthDetails, clearAuthDetails]);

  return <>{children}</>;
}
