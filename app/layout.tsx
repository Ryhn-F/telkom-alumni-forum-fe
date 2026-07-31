import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Forum Alumni SMK Telkom Jakarta - Ruang Komunitas & Diskusi",
    template: "%s | Forum Alumni SMK Telkom Jakarta",
  },
  description:
    "Platform resmi diskusi, komunitas, berbagi pengalaman karir, dan informasi terkini untuk siswa & alumni SMK Telkom Jakarta.",
  keywords: [
    "SMK Telkom Jakarta",
    "Forum Telkom",
    "Alumni Telkom",
    "Diskusi Telkom",
    "Komunitas Sekolah",
    "Telkom School",
  ],
  authors: [{ name: "SMK Telkom Jakarta Alumni Community" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    siteName: "Forum Alumni SMK Telkom Jakarta",
    title: "Forum Alumni SMK Telkom Jakarta - Ruang Komunitas & Diskusi",
    description:
      "Platform resmi diskusi, komunitas, berbagi pengalaman karir, dan informasi terkini untuk siswa & alumni SMK Telkom Jakarta.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forum Alumni SMK Telkom Jakarta",
    description:
      "Platform resmi diskusi, komunitas, berbagi pengalaman karir, dan informasi terkini untuk siswa & alumni SMK Telkom Jakarta.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Forum Alumni SMK Telkom Jakarta",
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
