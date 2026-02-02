"use client";

import { auth } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";

export default function SignInPage() {
  const router = useRouter();
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (authReady && uid) {
      router.push("/documents");
    }
  }, [authReady, uid, router]);

  // Show loading while auth state is being determined
  if (!authReady || uid) {
    return (
      <div className="flex items-center justify-center py-12">
        <ClipLoader size={40} color="#3b82f6" />
      </div>
    );
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/documents");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      // Clean up Firebase error messages
      if (message.includes("auth/invalid-credential")) {
        setError("Invalid email or password");
      } else if (message.includes("auth/user-not-found")) {
        setError("No account found with this email");
      } else if (message.includes("auth/wrong-password")) {
        setError("Incorrect password");
      } else if (message.includes("auth/too-many-requests")) {
        setError("Too many attempts. Please try again later");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/documents");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      if (message.includes("auth/popup-closed-by-user")) {
        setError("Sign in cancelled");
      } else {
        setError(message);
      }
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

        {error && <div className="banner-error mb-4">{error}</div>}

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
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
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
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="btn w-full border border-slate-300 bg-white hover:bg-slate-50"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
