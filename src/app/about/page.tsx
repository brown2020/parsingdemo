import Link from "next/link";

export const metadata = {
  title: "About | ParsingDemo",
  description: "About ParsingDemo - Document parsing and conversion made simple",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">About ParsingDemo</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">What We Do</h2>
          <p className="text-slate-600 leading-relaxed">
            ParsingDemo is a document parsing and conversion platform that helps you standardize
            multiple file formats into PDFs, extract text content, and analyze documents using AI.
            Whether you need to convert Word documents, parse emails, or extract text from PDFs,
            we make it simple and fast.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Supported Formats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">PDF</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">DOCX</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📧</div>
              <div className="font-medium">EML</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📨</div>
              <div className="font-medium">MSG</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-medium">Images</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📸</div>
              <div className="font-medium">HEIC</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Key Features</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">✓</span>
              <div>
                <strong className="text-slate-800">Document Conversion</strong>
                <p className="text-slate-600 text-sm">Convert documents to PDF format with high fidelity</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">✓</span>
              <div>
                <strong className="text-slate-800">Text Extraction</strong>
                <p className="text-slate-600 text-sm">Extract text content from any supported document type</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">✓</span>
              <div>
                <strong className="text-slate-800">AI Analysis</strong>
                <p className="text-slate-600 text-sm">Use AI to analyze and summarize your documents</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">✓</span>
              <div>
                <strong className="text-slate-800">Secure Storage</strong>
                <p className="text-slate-600 text-sm">Your documents are stored securely in the cloud</p>
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Technology</h2>
          <p className="text-slate-600 leading-relaxed">
            Built with modern technologies including Next.js, React, Firebase, and various
            document processing libraries. We use industry-standard security practices to
            keep your documents safe.
          </p>
        </section>

        <section className="bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Get Started</h2>
          <p className="text-slate-600 mb-4">
            Ready to streamline your document workflow? Sign up for free and get 1,000 credits
            to start converting and analyzing your documents.
          </p>
          <Link href="/sign-up" className="btn-primary inline-block">
            Create Free Account
          </Link>
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
