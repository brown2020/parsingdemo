import AuthGuard from "@/components/AuthGuard";
import Profile from "@/components/Profile";

export default function Account() {
  return (
    <AuthGuard>
      <Profile />
    </AuthGuard>
  );
}
