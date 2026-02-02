import AuthGuard from "@/components/AuthGuard";
import PaymentSuccessPage from "@/components/PaymentSuccessPage";

export default function PaymentSuccess({
  searchParams,
}: {
  searchParams?: { payment_intent?: string };
}) {
  const payment_intent = searchParams?.payment_intent ?? "";
  return (
    <AuthGuard>
      <PaymentSuccessPage payment_intent={payment_intent} />
    </AuthGuard>
  );
}
