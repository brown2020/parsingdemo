"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const uid = useAuthStore((state) => state.uid);
  const firebaseUid = useAuthStore((state) => state.firebaseUid);
  const photoUrl = useAuthStore((state) => state.authPhotoUrl);
  const fullName = useAuthStore((state) => state.authDisplayName);

  // Show landing page for unauthenticated users
  if (!uid) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Document Parsing Made Simple
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Upload, convert, and analyze documents with ease. Support for PDF,
            DOCX, emails, and images.
          </p>
          <div className="flex gap-4 justify-center">
            <Link className="btn-primary" href="/sign-up">
              Get Started Free
            </Link>
            <Link className="btn-ghost" href="/about">
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl">
          <div className="text-center">
            <div className="text-3xl mb-2">📄</div>
            <div className="font-medium">PDF & DOCX</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📧</div>
            <div className="font-medium">Email Files</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="font-medium">Images</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤖</div>
            <div className="font-medium">AI Analysis</div>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  return (
    <div className="flex items-center justify-center py-10">
      <div className="card w-full max-w-md">
        <div className="card-header">
          <h1 className="text-lg font-semibold">Welcome back!</h1>
          <p className="muted text-sm">
            Upload, convert, and analyze documents.
          </p>
        </div>
        <div className="card-content">
          <div className="flex flex-col items-center mb-4">
            {photoUrl ? (
              <Image
                width={150}
                height={150}
                src={photoUrl}
                alt="User Avatar"
                className="w-24 h-24 rounded-full mb-2"
              />
            ) : (
              <div className="flex items-center justify-center text-white bg-blue-600 w-24 h-24 rounded-full mb-2 text-2xl font-semibold">
                {fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <div className="text-lg font-medium">
              {fullName || "User"}
            </div>
          </div>
          {firebaseUid ? (
            <div className="text-center text-green-700 mb-4 text-sm">
              Connected to database
            </div>
          ) : (
            <div className="text-center text-amber-600 mb-4 text-sm">
              Connecting to database...
            </div>
          )}
          <div className="flex justify-center">
            <Link className="btn-primary" href="/documents">
              Go to Documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
