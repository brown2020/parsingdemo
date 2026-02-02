import AuthGuard from "@/components/AuthGuard";
import PaymentsPage from "@/components/PaymentsPage";

export default function Payments() {
  return (
    <AuthGuard>
      <PaymentsPage />
    </AuthGuard>
  );
}
