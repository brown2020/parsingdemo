"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";

type Props = {
  children: React.ReactNode;
};

/**
 * Client-side auth guard for protected routes.
 * Redirects to sign-in if user is not authenticated.
 */
export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);

  useEffect(() => {
    // Wait for auth to be ready before checking
    if (authReady && !uid) {
      router.push("/sign-in");
    }
  }, [uid, authReady, router]);

  // Show loading while auth state is being determined
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClipLoader size={40} color="#3b82f6" />
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!uid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClipLoader size={40} color="#3b82f6" />
      </div>
    );
  }

  return <>{children}</>;
}
