import { buildAlternateLocalePaths } from "@/lib/i18n";
import { allPages } from "@/lib/seo-matrix";
import { TOOLS } from "@/lib/tools-registry";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://logicvault.org";
export const SITE_NAME = "Logic Vault";

export function buildAlternateLanguages(pathname: string) {
  return buildAlternateLocalePaths(pathname);
}

export function buildToolUrl(slug: string) {
  return `/tool/${slug}`;
}

export const SEO_PAGES = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/trust",
  "/security",
  "/compliance",
  ...TOOLS.map((tool) => buildToolUrl(tool.id)),
  ...allPages.map((slug) => `/convert/${slug}`),
];
