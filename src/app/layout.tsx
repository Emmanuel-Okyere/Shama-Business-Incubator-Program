import type { Metadata, Viewport } from "next";
import { Ubuntu, Public_Sans } from "next/font/google";
import { PROGRAMME } from "@/lib/programme";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shama-incubator.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${PROGRAMME.name} — ${PROGRAMME.tagline}`,
    template: `%s · ${PROGRAMME.name}`,
  },
  description:
    "An entrepreneurship programme identifying, training, mentoring and funding 100 young entrepreneurs in Ghana's Shama Constituency. GHS 480,000 in grant funding across four business clusters.",
  keywords: [
    "Shama Business Incubator",
    "youth entrepreneurship Ghana",
    "business funding Ghana",
    "Shama Constituency",
    "Emelia Arthur",
    "business incubator Western Region",
    "grant funding for entrepreneurs",
    "fisheries and aquaculture business Ghana",
  ],
  authors: [{ name: PROGRAMME.name }],
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: PROGRAMME.name,
    title: `${PROGRAMME.name} — ${PROGRAMME.tagline}`,
    description:
      "100 entrepreneurs. Four clusters. An 8-week bootcamp, one-on-one mentorship and GHS 480,000 in grant funding for businesses in Shama.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PROGRAMME.name} — ${PROGRAMME.tagline}`,
    description:
      "100 entrepreneurs. Four clusters. GHS 480,000 in grant funding for businesses in Shama, Ghana.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#8ab61a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={`${ubuntu.variable} ${publicSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
