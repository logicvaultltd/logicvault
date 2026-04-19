import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const crawlRules = {
    allow: ["/"],
    disallow: ["/api/", "/lex/", "/admin"],
  };

  return {
    rules: [
      {
        userAgent: "*",
        ...crawlRules,
      },
      {
        userAgent: "Googlebot",
        ...crawlRules,
      },
      {
        userAgent: "Bingbot",
        ...crawlRules,
      },
      {
        userAgent: "DuckDuckBot",
        ...crawlRules,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
