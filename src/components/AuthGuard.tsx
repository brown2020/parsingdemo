"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

type Props = {
  children: React.ReactNode;
};

/**
 * Client-side auth UX for protected routes.
 * Edge soft-gate lives in `src/proxy.ts` (cookie presence).
 * Avoid client-side router redirects — show a Link instead.
 */
export default function AuthGuard({ children }: Props) {
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClipLoader size={40} color="#1d4ed8" />
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <p className="text-slate-700">Sign in required to view this page.</p>
        <Link href="/sign-in" className="btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
