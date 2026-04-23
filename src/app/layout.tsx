import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://burnoutiqtest.com";
const SITE_NAME = "BurnoutIQ";
const SITE_TITLE = "BurnoutIQ — Measure Burnout Before It Measures You";
const SITE_DESCRIPTION =
  "BurnoutIQ is a science-backed burnout risk assessment that measures emotional exhaustion, depersonalization, and reduced accomplishment — before they become attrition. Built on Maslach's Burnout Inventory framework by Pivot Training & Development.";

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
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "burnout assessment",
    "burnout risk",
    "Maslach Burnout Inventory",
    "emotional exhaustion",
    "depersonalization",
    "reduced accomplishment",
    "workplace burnout",
    "employee burnout",
    "burnout prevention",
    "burnout test",
    "team burnout",
    "burnout measurement",
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
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLdWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Free Burnout Risk Score",
    },
    {
      "@type": "Offer",
      price: "9.97",
      priceCurrency: "USD",
      name: "Pro — Full 3-Dimension Burnout Profile",
    },
    {
      "@type": "Offer",
      price: "49.97",
      priceCurrency: "USD",
      name: "Professional — Includes Coaching Debrief",
    },
  ],
  creator: {
    "@type": "Organization",
    name: "Pivot Training & Development",
    url: "https://www.pivottraining.us",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pivot Training & Development",
  url: "https://www.pivottraining.us",
  sameAs: [SITE_URL, "https://pressureiqtest.com"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
