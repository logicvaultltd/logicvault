import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { DeferredShellOverlays } from "@/components/deferred-shell-overlays";
import { Footer } from "@/components/footer";
import { GlobalAdProvider } from "@/components/global-ad-provider";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import {
  CIRCADIAN_DARK_START_HOUR,
  CIRCADIAN_LIGHT_START_HOUR,
  ThemeProvider,
} from "@/components/theme-provider";
import { VaultProvider } from "@/context/vault-context";
import { getSiteConfig } from "@/lib/config-provider";
import {
  GLOBAL_KEYWORDS,
  buildOrganizationSchema,
  buildWebsiteSchema,
} from "@/lib/seo";
import { buildAlternateLanguages, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: GLOBAL_KEYWORDS,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "BusinessApplication",
    referrer: "origin-when-cross-origin",
    manifest: "/manifest.webmanifest",
    alternates: {
      canonical: "/",
      languages: buildAlternateLanguages("/"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: "/",
      siteName: "Logic Vault",
      type: "website",
      images: [config.openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: config.metaTitle,
      description: config.metaDescription,
      images: [config.openGraphImage],
    },
    appleWebApp: {
      capable: true,
      title: SITE_NAME,
      statusBarStyle: "black-translucent",
    },
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "mobile-web-app-capable": "yes",
    },
    icons: {
      icon: [
        { url: "/extension/icons/icon16.png", type: "image/png", sizes: "16x16" },
        { url: "/extension/icons/icon48.png", type: "image/png", sizes: "48x48" },
        { url: "/extension/icons/icon192.png", type: "image/png", sizes: "192x192" },
        { url: "/extension/icons/icon512.png", type: "image/png", sizes: "512x512" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/extension/icons/icon48.png",
      apple: [
        { url: "/extension/icons/icon192.png", type: "image/png", sizes: "192x192" },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <Script id="logicvault-theme-init" strategy="beforeInteractive">
          {`try {
            const hour = new Date().getHours();
            const theme =
              hour >= ${CIRCADIAN_LIGHT_START_HOUR} && hour < ${CIRCADIAN_DARK_START_HOUR}
                ? 'light'
                : 'dark';
            document.documentElement.dataset.theme = theme;
            document.documentElement.style.colorScheme = theme;
          } catch {
            document.documentElement.dataset.theme = 'dark';
            document.documentElement.style.colorScheme = 'dark';
          }`}
        </Script>
        <JsonLd data={[buildOrganizationSchema(), buildWebsiteSchema()]} />
        <GlobalAdProvider config={config}>
          <ThemeProvider>
            <VaultProvider>
              <DeferredShellOverlays />
              <Header />
              {children}
              <Footer />
            </VaultProvider>
          </ThemeProvider>
        </GlobalAdProvider>
      </body>
    </html>
  );
}
