import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeDoc | Intelligent PII Redaction",
  description: "Securely detect and redact PII from documents with zero persistence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Krona+One&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans" style={{ fontFamily: '"Krona One", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
