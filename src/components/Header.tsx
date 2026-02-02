"use client";

import { auth } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const uid = useAuthStore((state) => state.uid);
  const displayName = useAuthStore((state) => state.authDisplayName);
  const photoUrl = useAuthStore((state) => state.authPhotoUrl);
  const [showMenu, setShowMenu] = useState(false);

  useInitializeStores();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isSignedIn = !!uid;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container-app flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          ParsingDemo
        </Link>

        {!isSignedIn ? (
          <Link href="/sign-in" className="btn-primary">
            Sign In
          </Link>
        ) : (
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

            {/* User menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 hover:border-slate-300 transition-colors"
              >
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={displayName || "User"}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    {displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {displayName || "User"}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
