import type { Metadata } from "next";
import "./globals.css";

/**
 * This is a private study entry point, not a public recruitment website.
 * Search engines should not index the study pages.
 */
export const metadata: Metadata = {
  title: "AI-Assisted Quality Inspection | Research Study",
  description: "A research study about quality inspection with AI assistance.",
  robots: { index: false, follow: false }
};

/**
 * Shared document structure for every stage of the experiment.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
