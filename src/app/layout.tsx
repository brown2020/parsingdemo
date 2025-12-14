import type { Metadata } from "next";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
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
    <ClerkProvider dynamic>
      <html lang="en" className="h-full">
        <body className="flex min-h-screen flex-col">
          <Header />
          <main className="page">
            <div className="page-inner">{children}</div>
          </main>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
