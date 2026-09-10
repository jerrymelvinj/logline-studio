import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "YouTube Content Curation & Execution Studio",
  description:
    "AI-assisted YouTube video drafting, high-CTR hook curation, script outlines, and live Google Sheets pipeline sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-pageBg">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
