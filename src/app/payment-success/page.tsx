import PaymentSuccessPage from "@/components/PaymentSuccessPage";

export default function PaymentSuccess({
  searchParams,
}: {
  searchParams?: { payment_intent?: string };
}) {
  const payment_intent = searchParams?.payment_intent ?? "";
  return <PaymentSuccessPage payment_intent={payment_intent} />;
}
