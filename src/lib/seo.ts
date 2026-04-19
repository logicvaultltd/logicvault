import type { Metadata } from "next";

import type { AppLocale } from "@/lib/i18n";
import { buildAlternateLanguages, SITE_NAME, SITE_URL } from "@/lib/site";

export const DEFAULT_OG_IMAGE = "/extension/icons/icon128.png";

export const GLOBAL_KEYWORDS = [
  "PDF editor",
  "free PDF tools",
  "secure PDF converter",
  "Account Statement to CSV",
  "bank statement converter",
  "account statement converter",
  "financial document tools",
  "Merge PDF free",
  "Split PDF online",
  "Compress PDF free",
  "PDF to Excel",
  "PDF to Word",
  "OCR PDF",
  "AI PDF summarizer",
  "secure financial tools",
  "local file processing",
  "global finance tools",
  "business calculators",
  "real estate yield calculator",
  "marketing ROI calculator",
  "json formatter online",
  "json validator online",
  "json to typescript interface",
  "json minifier",
  "json tree viewer",
  "xml to json converter",
  "csv to json converter",
  "yaml to json converter",
  "compare PDF",
  "redact PDF",
  "crop PDF",
  "scan to PDF",
  "developer utility",
  "secure PDF",
  "JSON converter",
];

interface SeoMetadataInput {
  title: string;
  description: string;
  path: string;
  locale?: AppLocale | null;
  keywords?: readonly string[];
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

function normalizePath(path: string) {
  if (path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function absoluteUrl(path: string) {
  const normalizedPath = normalizePath(path);
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function localizedPath(path: string, locale?: AppLocale | null) {
  const normalizedPath = normalizePath(path);

  if (!locale) {
    return normalizedPath;
  }

  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function buildSeoMetadata({
  title,
  description,
  path,
  locale = null,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
}: SeoMetadataInput): Metadata {
  const canonical = localizedPath(path, locale);
  const keywordSet = Array.from(new Set([...GLOBAL_KEYWORDS, ...keywords]));

  return {
    title,
    description,
    keywords: keywordSet,
    alternates: {
      canonical,
      languages: buildAlternateLanguages(path),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: `${title} | ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
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
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/extension/icons/icon128.png"),
    email: "ops@logicvault.org",
    description:
      "Logic Vault provides secure financial document tools, PDF utilities, and business calculators for global users.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "ops@logicvault.org",
      availableLanguage: [
        "English",
        "Spanish",
        "French",
        "Portuguese",
        "Chinese",
        "Arabic",
        "German",
        "Hindi",
        "Italian",
        "Japanese",
        "Dutch",
        "Indonesian",
        "Korean",
        "Turkish",
      ],
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en",
    description:
      "Free, secure PDF tools, account statement converters, AI document utilities, and financial calculators.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string; locale?: AppLocale | null }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localizedPath(item.path, item.locale)),
    })),
  };
}

export function buildWebPageSchema({
  title,
  description,
  path,
  locale = null,
}: {
  title: string;
  description: string;
  path: string;
  locale?: AppLocale | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(localizedPath(path, locale)),
    inLanguage: locale ?? "en",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildSoftwareApplicationSchema({
  name,
  description,
  path,
  locale = null,
  keywords = [],
}: {
  name: string;
  description: string;
  path: string;
  locale?: AppLocale | null;
  keywords?: readonly string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl(localizedPath(path, locale)),
    description,
    keywords: keywords.join(", "),
    inLanguage: locale ?? "en",
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
