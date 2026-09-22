"use client";

import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { deleteCookie, setCookie } from "cookies-next";
import { useEffect } from "react";

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";

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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void (async () => {
        if (user) {
          try {
            const token = await getIdToken(user);
            setCookie(COOKIE_NAME, token, {
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
          } catch {
            deleteCookie(COOKIE_NAME, { path: "/" });
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
          deleteCookie(COOKIE_NAME, { path: "/" });
          deleteCookie("__session", { path: "/" });
          clearAuthDetails();
          setAuthDetails({ authReady: true });
        }
      })();
    });

    return () => unsubscribe();
  }, [setAuthDetails, clearAuthDetails]);

  return <>{children}</>;
}
