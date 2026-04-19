export const STATIC_PAGE_SEO = {
  about: {
    path: "/about",
    title: "About Logic Vault | Secure Global Financial Tools",
    description:
      "Learn how Logic Vault helps global users process account statements, PDFs, and financial workflows with secure, utility-first tools.",
    keywords: [
      "about Logic Vault",
      "global financial infrastructure",
      "secure document tools",
      "financial utility platform",
    ],
  },
  contact: {
    path: "/contact",
    title: "Contact Logic Vault | Partnerships, Support & Ad Placement",
    description:
      "Contact Logic Vault for partnerships, ad placement, technical support, integrations, and secure financial workflow inquiries.",
    keywords: [
      "contact Logic Vault",
      "ad placement",
      "PDF tool partnership",
      "financial tool support",
    ],
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy | Logic Vault - Zero-Data-Retention",
    description:
      "Read Logic Vault's privacy policy for account statement processing, local-first document workflows, GDPR, CCPA, and zero-data-retention principles.",
    keywords: [
      "Logic Vault privacy",
      "zero data retention",
      "GDPR PDF tools",
      "CCPA financial tools",
      "secure account statement processing",
    ],
  },
  terms: {
    path: "/terms",
    title: "Terms of Service | Logic Vault Free Financial Utilities",
    description:
      "Review Logic Vault's terms of service for free PDF tools, financial calculators, account statement converters, and shared reports.",
    keywords: [
      "Logic Vault terms",
      "free utility terms",
      "financial tool disclaimer",
      "PDF converter terms",
    ],
  },
  trust: {
    path: "/trust",
    title: "Trust Center | Logic Vault Secure Document Workflows",
    description:
      "Explore Logic Vault's trust principles for privacy, transparency, local-first processing, secure downloads, and sensitive financial workflows.",
    keywords: [
      "Logic Vault trust",
      "secure document workflow",
      "financial document privacy",
      "local-first processing",
    ],
  },
  security: {
    path: "/security",
    title: "Security | Logic Vault Local-First Financial Tools",
    description:
      "Understand Logic Vault's security design for local-first processing, encrypted workflows, short-lived cloud jobs, and account statement protection.",
    keywords: [
      "Logic Vault security",
      "secure PDF processing",
      "AES-256 financial documents",
      "local-first PDF tools",
    ],
  },
  compliance: {
    path: "/compliance",
    title: "Compliance | Logic Vault Global Document Standards",
    description:
      "Review Logic Vault's compliance stance for international document handling, privacy-by-design workflows, and secure financial utilities.",
    keywords: [
      "Logic Vault compliance",
      "international document handling",
      "privacy by design",
      "financial document compliance",
    ],
  },
} as const;

export type StaticPageKey = keyof typeof STATIC_PAGE_SEO;
