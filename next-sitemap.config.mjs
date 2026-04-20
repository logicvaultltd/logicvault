const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://logicvault.org";

const nextSitemapConfig = {
  siteUrl,
  generateRobotsTxt: false,
  sitemapSize: 5000,
  exclude: ["/lex/*", "/admin"],
  transform: async (_, path) => ({
    loc: `${siteUrl}${path}`,
    changefreq: path.startsWith("/convert/") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
    lastmod: new Date().toISOString(),
  }),
};

export default nextSitemapConfig;
