import type { MetadataRoute } from "next";

import { SUPPORTED_LOCALES } from "@/lib/i18n";
import { allPages } from "@/lib/seo-matrix";
import { buildAlternateLanguages, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools-registry";

const CORE_PAGES = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/trust",
  "/security",
  "/compliance",
] as const;

const EXCLUDED_ROUTE_PATTERNS = [/placeholder/i, /test/i, /demo/i, /example/i];

function isIndexableValue(value: string) {
  return !EXCLUDED_ROUTE_PATTERNS.some((pattern) => pattern.test(value));
}

function isIndexableTool(tool: (typeof TOOLS)[number]) {
  const keywords = tool.keywords ?? [];
  const isPlaceholderTool =
    tool.buttonLabel === "Reserve Tool" ||
    keywords.some((keyword) => keyword.toLowerCase().includes("placeholder"));

  return !isPlaceholderTool && isIndexableValue(tool.id);
}

function toAbsoluteUrl(path: string) {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

function buildBaseEntry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: toAbsoluteUrl(path),
    alternates: {
      languages: Object.fromEntries(
        Object.entries(buildAlternateLanguages(path)).map(([tag, localizedPath]) => [
          tag,
          toAbsoluteUrl(localizedPath),
        ])
      ),
    },
  };
}

function buildLocalizedEntry(
  locale: (typeof SUPPORTED_LOCALES)[number],
  path: string
): MetadataRoute.Sitemap[number] {
  return {
    url: toAbsoluteUrl(`/${locale}${path === "/" ? "" : path}`),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPaths = TOOLS.filter((tool) => isIndexableTool(tool)).map(
    (tool) => `/tool/${tool.id}`
  );
  const conversionPaths = allPages
    .filter((slug) => isIndexableValue(slug))
    .map((slug) => `/convert/${slug}`);
  const indexablePaths = [...CORE_PAGES, ...toolPaths, ...conversionPaths];

  const baseEntries = indexablePaths.map((path) => buildBaseEntry(path));
  const localizedEntries = indexablePaths.flatMap((path) =>
    SUPPORTED_LOCALES.map((locale) => buildLocalizedEntry(locale, path))
  );

  return [...baseEntries, ...localizedEntries];
}
