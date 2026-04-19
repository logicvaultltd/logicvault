import type { MetadataRoute } from "next";

import { SUPPORTED_LOCALES } from "@/lib/i18n";
import { buildAlternateLanguages, SEO_PAGES, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const getSeoSettings = (path: string) => ({
    changeFrequency:
      path.startsWith("/tool/") || path.startsWith("/convert/") ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path.startsWith("/tool/")
          ? 0.82
          : path.startsWith("/convert/")
            ? 0.8
            : 0.72,
  }) as const;

  const buildEntry = (path: string, basePath = path): MetadataRoute.Sitemap[number] => {
    const { changeFrequency, priority } = getSeoSettings(basePath);

    return {
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(buildAlternateLanguages(basePath)).map(([tag, localizedPath]) => [
            tag,
            `${SITE_URL}${localizedPath === "/" ? "" : localizedPath}`,
          ])
        ),
      },
    };
  };

  const baseEntries = SEO_PAGES.map((path) => buildEntry(path));
  const localizedEntries = SEO_PAGES.flatMap((path) =>
    SUPPORTED_LOCALES.map((locale) =>
      buildEntry(`/${locale}${path === "/" ? "" : path}`, path)
    )
  );

  return [...baseEntries, ...localizedEntries];
}
