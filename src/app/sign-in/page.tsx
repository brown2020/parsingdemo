"use client";

import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import { mapAuthError } from "@/utils/authErrors";
import PasswordField from "@/components/PasswordField";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getIdToken,
} from "firebase/auth";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipLoader } from "react-spinners";

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";

export default function SignInPage() {
  const router = useRouter();
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <ClipLoader size={40} color="#1d4ed8" />
      </div>
    );
  }

  if (uid) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-slate-700">You are already signed in.</p>
        <Link href="/documents" className="btn-primary">
          Go to documents
        </Link>
      </div>
    );
  }

  const settleSession = async () => {
    if (!auth?.currentUser) return;
    const token = await getIdToken(auth.currentUser, true);
    setCookie(COOKIE_NAME, token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    const u = auth.currentUser;
    setAuthDetails({
      uid: u.uid,
      firebaseUid: u.uid,
      authEmail: u.email || "",
      authDisplayName: u.displayName || "",
      authPhotoUrl: u.photoURL || "",
      authEmailVerified: u.emailVerified,
      authReady: true,
    });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!hasClientConfig) {
      setError("Authentication is not configured.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await settleSession();
      router.replace("/documents");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    if (!hasClientConfig) {
      setError("Authentication is not configured.");
      return;
    }
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await settleSession();
      router.replace("/documents");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="banner-error mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            disabled={loading}
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <ClipLoader size={20} color="#ffffff" />
            ) : (
              "Sign in with Email"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">or</span>
          </div>
        </div>

        <GoogleAuthButton onClick={handleGoogleSignIn} disabled={loading} />

        <p className="text-center text-sm text-slate-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-blue-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
