import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Logic Vault",
    short_name: "LogicVault",
    description:
      "Secure financial, PDF, and developer utilities built for fast local-first workflows.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050505",
    theme_color: "#FF0000",
    categories: ["business", "finance", "productivity", "utilities"],
    shortcuts: [
      {
        name: "JSON Formatter",
        short_name: "JSON",
        description: "Format, validate, and clean JSON locally.",
        url: "/tool/json-formatter-validator/",
        icons: [{ src: "/extension/icons/icon192.png", sizes: "192x192" }],
      },
      {
        name: "Compare PDF",
        short_name: "Compare",
        description: "Compare two PDF versions and generate a change report.",
        url: "/tool/compare-pdf/",
        icons: [{ src: "/extension/icons/icon192.png", sizes: "192x192" }],
      },
      {
        name: "Redact PDF",
        short_name: "Redact",
        description: "Black out sensitive PDF areas before sharing.",
        url: "/tool/redact-pdf/",
        icons: [{ src: "/extension/icons/icon192.png", sizes: "192x192" }],
      },
    ],
    icons: [
      {
        src: "/extension/icons/icon16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/extension/icons/icon48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/extension/icons/icon192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/extension/icons/icon512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/extension/icons/icon512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
