import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-slate-500 text-sm">
            &copy; {currentYear} ParsingDemo. All rights reserved.
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/about"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
