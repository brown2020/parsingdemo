import { useAuthStore } from "@/zustand/useAuthStore";

export default function AuthDataDisplay() {
  const uid = useAuthStore((s) => s.uid);
  const authEmail = useAuthStore((s) => s.authEmail);

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-4">Account Details</h3>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Login email</label>
          <div className="px-3 py-2 text-slate-900 bg-slate-100 rounded-md">
            {authEmail || "—"}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">User ID</label>
          <div className="px-3 py-2 text-slate-900 bg-slate-100 rounded-md font-mono text-sm">
            {uid || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
