"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const uid = useAuthStore((state) => state.uid);
  const firebaseUid = useAuthStore((state) => state.firebaseUid);
  const photoUrl = useAuthStore((state) => state.authPhotoUrl);
  const fullName = useAuthStore((state) => state.authDisplayName);

  return (
    <div className="flex items-center justify-center py-10">
      <div className="card w-full max-w-md">
        <div className="card-header">
          <div className="text-lg font-semibold">ParsingDemo</div>
          <div className="muted text-sm">
            Upload, convert, and analyze documents.
          </div>
        </div>
        <div className="card-content">
          <div className="flex flex-col items-center mb-4">
            {/* User Avatar */}
            {photoUrl ? (
              <Image
                width={150}
                height={150}
                src={photoUrl}
                alt="User Avatar"
                className="w-24 h-24 rounded-full mb-2"
              />
            ) : (
              <div className="flex items-center justify-center text-white bg-blue-500 w-24 h-24 rounded-full mb-2">
                {fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <div className="text-lg font-medium">
              Clerk User: {uid || "No User"}
            </div>
          </div>
          {firebaseUid ? (
            <div className="text-center text-green-700 mb-4 text-sm">
              Logged Into Firebase: {firebaseUid}
            </div>
          ) : (
            <div className="text-center text-red-700 mb-4 text-sm">
              Not Logged Into Firebase
            </div>
          )}
          <div className="flex justify-center">
            {firebaseUid && (
              <Link className="btn-primary w-40" href="/documents">
                Documents
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
