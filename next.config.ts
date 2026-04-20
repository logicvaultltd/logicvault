import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  sw: "sw.js",
  register: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: true,
  // Disable the plugin's auto-detected app/~offline document fallback. When Chrome
  // keeps an older worker around, that fallback can trap healthy page loads.
  fallbacks: null as unknown as undefined,
  workboxOptions: {
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/extension\/icons\/.*\.png$/,
        handler: "CacheFirst",
        options: {
          cacheName: "logicvault-brand-assets",
          expiration: {
            maxEntries: 12,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  trailingSlash: true,
  // Keep Node-native PDF/image packages out of the RSC/route bundler on Vercel.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "canvas", "sharp"],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          // API endpoints should not be indexed directly by search engines.
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 40, 48, 64, 96, 128, 192, 256, 384, 512],
    minimumCacheTTL: 31_536_000,
    qualities: [75, 85, 95],
  },
};

export default withPWA(nextConfig);
