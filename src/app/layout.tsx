import type { Metadata } from "next";

import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ParsingDemo",
  description:
    "Parsing Demo: A simple demo for parsing various document types.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          <main className="page flex-1">
            <div className="page-inner">{children}</div>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
