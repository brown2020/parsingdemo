import Link from "next/link";
import LegalSection from "@/components/LegalSection";

export const metadata = {
  title: "Privacy Policy | ParsingDemo",
  description: "Privacy Policy for ParsingDemo document parsing service",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-slate-500 mb-8">Last updated: September 2026</p>

      <div className="space-y-8">
        <LegalSection title="1. Introduction">
          <p>
            ParsingDemo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, and safeguard your information when you use our
            document parsing and conversion service.
          </p>
        </LegalSection>

        <LegalSection title="2. Information We Collect">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> Email address, name, and
              profile picture when you sign up via Firebase Authentication.
            </li>
            <li>
              <strong>Uploaded Documents:</strong> Files you upload for parsing
              and conversion, stored in Firebase Storage.
            </li>
            <li>
              <strong>Payment Information:</strong> Transaction records in our
              database. Card details are processed by Stripe and are not stored
              on our servers.
            </li>
            <li>
              <strong>Usage Data:</strong> Credits used and documents processed.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. How We Use Your Information">
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our document parsing service</li>
            <li>To process payments and manage account credits</li>
            <li>To communicate about your account or transactions</li>
            <li>To improve our services</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Data Storage and Security">
          <p>
            Data is stored using Firebase (Firestore and Storage) with security
            rules. We apply industry-standard measures against unauthorized
            access, alteration, or destruction.
          </p>
        </LegalSection>

        <LegalSection title="5. Third-Party Services">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Firebase Authentication:</strong> User sign-in
            </li>
            <li>
              <strong>Firebase:</strong> Data storage and file hosting
            </li>
            <li>
              <strong>Stripe:</strong> Payment processing
            </li>
            <li>
              <strong>AI Providers:</strong> Optional document analysis
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Your Rights">
          <p>
            You may access, update, or delete personal information from your
            account page or by contacting us.
          </p>
        </LegalSection>

        <LegalSection title="7. Data Retention">
          <p>
            We retain data while your account is active or as needed to provide
            services. You may delete uploaded documents at any time.
          </p>
        </LegalSection>

        <LegalSection title="8. Contact">
          <p>
            Questions? Reach out via the contact details on our{" "}
            <Link href="/about" className="text-blue-700 hover:underline">
              About
            </Link>{" "}
            page.
          </p>
        </LegalSection>
      </div>
    </div>
  );
}
