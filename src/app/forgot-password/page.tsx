"use client";

import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { mapAuthError } from "@/utils/authErrors";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!hasClientConfig) {
      setError("Authentication is not configured.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="card w-full max-w-md p-8 space-y-4" role="status">
          <h1 className="text-2xl font-bold text-center">Check your email</h1>
          <p className="text-sm text-slate-700">
            If an account exists for <strong>{email}</strong>, a password reset
            link is on its way. Check your inbox and spam folder.
          </p>
          <Link href="/sign-in" className="btn-primary w-full text-center">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="text-slate-600 mt-2">
            We&apos;ll email you a reset link
          </p>
        </div>

        {error && (
          <div className="banner-error mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reset-email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="reset-email"
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
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <ClipLoader size={20} color="#ffffff" />
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Remembered it?{" "}
          <Link href="/sign-in" className="text-blue-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
