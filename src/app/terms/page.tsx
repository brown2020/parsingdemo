import Link from "next/link";

export const metadata = {
  title: "Terms of Service | ParsingDemo",
  description: "Terms of Service for ParsingDemo document parsing service",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-slate-500 mb-8">Last updated: February 2025</p>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using ParsingDemo (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">
            ParsingDemo provides document parsing and conversion services, allowing users to
            upload documents in various formats (PDF, DOCX, EML, MSG, images) and convert them
            to standardized formats. The Service also offers AI-powered document analysis features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>You must create an account to use certain features of the Service.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must provide accurate and complete information when creating your account.</li>
            <li>You are responsible for all activities that occur under your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Credits and Payments</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>The Service operates on a credit-based system for certain features.</li>
            <li>Credits are purchased through our payment system powered by Stripe.</li>
            <li>All purchases are final and non-refundable unless required by law.</li>
            <li>We reserve the right to modify pricing at any time with reasonable notice.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Upload malicious files, viruses, or harmful content</li>
            <li>Use the Service for any illegal purposes</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Upload content that infringes on intellectual property rights</li>
            <li>Use the Service to process sensitive personal data without proper authorization</li>
            <li>Exceed reasonable usage limits or abuse the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed">
            You retain ownership of all documents you upload. By uploading content, you grant
            us a limited license to process your documents solely for the purpose of providing
            the Service. We do not claim ownership of your content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
          <p className="text-slate-600 leading-relaxed">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT
            GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR MEET YOUR
            SPECIFIC REQUIREMENTS. DOCUMENT CONVERSIONS MAY NOT BE PERFECT AND SHOULD BE
            VERIFIED FOR ACCURACY.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE,
            INCLUDING BUT NOT LIMITED TO LOSS OF DATA OR PROFITS.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
          <p className="text-slate-600 leading-relaxed">
            We reserve the right to suspend or terminate your access to the Service at any time
            for violations of these Terms or for any other reason at our discretion. Upon
            termination, your right to use the Service will immediately cease.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            We may modify these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the modified Terms. We will make reasonable efforts to
            notify users of significant changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
          <p className="text-slate-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws,
            without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            For questions about these Terms, please contact us through our support channels.
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
