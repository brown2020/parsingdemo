"use client";

import { auth } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Header() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);
  useInitializeStores();

  useEffect(() => {
    const syncAuthState = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken({ template: "integration_firebase" });
          if (!token)
            throw new Error("Missing Clerk Firebase integration token");

          const userCredentials = await signInWithCustomToken(auth, token);

          // Update Firebase user profile
          await updateProfile(userCredentials.user, {
            displayName: user.fullName,
            photoURL: user.imageUrl,
          });
          setAuthDetails({
            uid: user.id,
            firebaseUid: userCredentials.user.uid,
            authEmail: user.emailAddresses[0].emailAddress,
            authDisplayName: user.fullName || "",
            authPhotoUrl: user.imageUrl,
            authReady: true,
            authEmailVerified:
              user.emailAddresses?.[0]?.verification?.status === "verified",
          });
        } catch (error) {
          console.error("Error signing in with custom token:", error);
          clearAuthDetails();
        }
      } else {
        await firebaseSignOut(auth);
        clearAuthDetails();
      }
    };

    syncAuthState();
  }, [clearAuthDetails, getToken, isSignedIn, setAuthDetails, user]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container-app flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          ParsingDemo
        </Link>

        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <nav className="flex items-center gap-1">
            <Link
              href="/documents"
              className={`btn btn-ghost ${
                pathname?.startsWith("/documents")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-700"
              }`}
            >
              Documents
            </Link>
            <Link
              href="/account"
              className={`btn btn-ghost ${
                pathname?.startsWith("/account")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-700"
              }`}
            >
              Account
            </Link>

            <div className="ml-1">
              <UserButton />
            </div>
          </nav>
        </SignedIn>
      </div>
    </header>
  );
}
