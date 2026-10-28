"use client";

import Link from "next/link";
import useProfileStore from "@/zustand/useProfileStore";

export default function ProfileComponent() {
  const credits = useProfileStore((state) => state.profile.credits);

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 text-lg">
            <span className="text-slate-600">Credits Available:</span>{" "}
            <span className="font-semibold">{Math.round(credits)}</span>
          </div>
          <Link className="btn-primary" href={"/payment-attempt"}>
            Buy 10,000 Credits
          </Link>
        </div>
      </div>
    </div>
  );
}
