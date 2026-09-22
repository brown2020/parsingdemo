import AuthGuard from "@/components/AuthGuard";
import PaymentSuccessPage from "@/components/PaymentSuccessPage";

export default async function PaymentSuccess({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>;
}) {
  const params = await searchParams;
  const payment_intent = params?.payment_intent ?? "";
  return (
    <AuthGuard>
      <PaymentSuccessPage payment_intent={payment_intent} />
    </AuthGuard>
  );
}
