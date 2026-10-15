import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { env } from "@/lib/env";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: "HireVanta | Recruitment & Talent Acquisition",
    template: "%s | HireVanta",
  },
  description:
    "HireVanta connects ambitious professionals with companies building the future. Discover opportunities, find exceptional talent, and make your next career move with confidence.",
  keywords: [
    "recruitment",
    "talent acquisition",
    "staffing agency",
    "jobs",
    "hiring",
    "careers",
  ],
  authors: [{ name: "HireVanta" }],
  openGraph: {
    type: "website",
    siteName: "HireVanta",
    title: "HireVanta | Recruitment & Talent Acquisition",
    description:
      "Great talent. Better opportunities. Limitless possibilities. HireVanta connects professionals with companies building the future.",
    url: env.appUrl,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HireVanta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HireVanta | Recruitment & Talent Acquisition",
    description:
      "Great talent. Better opportunities. Limitless possibilities.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
