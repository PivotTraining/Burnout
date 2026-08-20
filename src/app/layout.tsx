import type { Metadata, Viewport } from "next";
import "./globals.css";
import PostHogClient from "@/components/PostHogClient";

const SITE_URL = "https://burnoutiqtest.com";
const SITE_NAME = "BurnoutIQ";
const SITE_TITLE = "BurnoutIQ — Workplace burnout screening and signal tool";
const SITE_DESCRIPTION =
  "BurnoutIQ is a non-clinical workplace burnout screening and signal tool from Pivot Training & Development. It measures 45 scored items across 9 dimensions and maps results to 8 Pivot-authored archetypes.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A1A2E" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A2E" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "BurnoutIQ",
    "PressureIQ",
    "workplace burnout screening",
    "workplace burnout",
    "burnout assessment",
    "burnout signal tool",
    "Pivot Training",
  ],
  authors: [{ name: "Pivot Training & Development" }],
  creator: "Pivot Training & Development",
  publisher: "Pivot Training & Development",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  verification: {
    google: "zbytZUE9QjRIEIDoslO6hrq1zkutVSyOeUdzf4ftKmc",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pivot Training & Development",
  url: "https://www.pivottraining.us",
  brand: [
    { "@type": "Brand", name: "BurnoutIQ", url: SITE_URL },
    { "@type": "Brand", name: "PressureIQ", url: "https://pressureiqtest.com" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <PostHogClient />
        {children}
      </body>
    </html>
  );
}
