import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | ParsingDemo",
  description: "Privacy Policy for ParsingDemo document parsing service",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-slate-500 mb-8">Last updated: February 2025</p>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-slate-600 leading-relaxed">
            ParsingDemo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information
            when you use our document parsing and conversion service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed mb-3">We collect the following types of information:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li><strong>Account Information:</strong> Email address, name, and profile picture when you sign up via Clerk authentication.</li>
            <li><strong>Uploaded Documents:</strong> Files you upload for parsing and conversion. These are stored in Firebase Storage.</li>
            <li><strong>Payment Information:</strong> Payment transaction records are stored in our database. Credit card details are processed securely by Stripe and are not stored on our servers.</li>
            <li><strong>Usage Data:</strong> Information about how you use our service, including credits used and documents processed.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>To provide and maintain our document parsing service</li>
            <li>To process your payments and manage your account credits</li>
            <li>To communicate with you about your account or transactions</li>
            <li>To improve our services and develop new features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
          <p className="text-slate-600 leading-relaxed">
            Your data is stored securely using Firebase (Firestore and Storage) with appropriate
            security rules. We implement industry-standard security measures to protect your
            information from unauthorized access, alteration, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
          <p className="text-slate-600 leading-relaxed mb-3">We use the following third-party services:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li><strong>Clerk:</strong> For user authentication</li>
            <li><strong>Firebase:</strong> For data storage and file hosting</li>
            <li><strong>Stripe:</strong> For payment processing</li>
            <li><strong>AI Providers:</strong> For document analysis (when you choose to use this feature)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            You have the right to access, update, or delete your personal information.
            You can manage your profile settings from your account page or contact us
            for assistance with data requests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
          <p className="text-slate-600 leading-relaxed">
            We retain your data for as long as your account is active or as needed to provide
            you services. You may delete your uploaded documents at any time. If you wish to
            delete your account entirely, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the
            &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us through
            our support channels.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
