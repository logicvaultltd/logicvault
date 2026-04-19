"use client";

import { useEffect, useMemo, useState } from "react";

import { TOOLS } from "@/lib/tools-registry";

interface SocialTickerItem {
  id: number | string;
  city: string | null;
  file_type: string | null;
  tool_slug: string | null;
}

interface SocialTickerProps {
  initialItems: SocialTickerItem[];
}

function formatTickerLine(item: SocialTickerItem) {
  const city = item.city?.trim() || "a city near you";
  const fileType = item.file_type?.trim().toUpperCase() || "a secure file";
  const toolTitle = TOOLS.find((tool) => tool.id === item.tool_slug)?.title;

  if (item.tool_slug === "json-universal-converter") {
    return `Someone in ${city} just converted ${fileType} to JSON`;
  }

  if (item.tool_slug === "protect-pdf") {
    return `Someone in ${city} just protected a PDF`;
  }

  if (item.tool_slug === "redact-pdf") {
    return `Someone in ${city} just redacted a PDF securely`;
  }

  if (item.tool_slug === "statement-to-csv") {
    return `Someone in ${city} just cleaned an account statement`;
  }

  return `Someone in ${city} just used ${toolTitle ?? "Logic Vault"} for ${fileType}`;
}

export function SocialTicker({ initialItems }: SocialTickerProps) {
  const [items, setItems] = useState<SocialTickerItem[]>(initialItems);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch("/api/activity", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { items: SocialTickerItem[] };

        if (payload.items.length > 0) {
          setItems(payload.items);
        }
      } catch {
        // Fallback to current items.
      }
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  const tickerItems = useMemo(
    () =>
      (items.length > 0
        ? items
        : [
            { id: "fallback-1", city: "London", file_type: "PDF", tool_slug: "merge-pdf" },
            { id: "fallback-2", city: "Lagos", file_type: "CSV", tool_slug: "statement-to-csv" },
            { id: "fallback-3", city: "Toronto", file_type: "ROI report", tool_slug: "roi-tracker" },
          ]
      ).map((item) => ({
        ...item,
        line: formatTickerLine(item),
      })),
    [items]
  );

  return (
    <div className="lv-social-ticker overflow-hidden rounded-[28px] px-4 py-3 text-sm">
      <div className="social-ticker-track flex gap-10 whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span key={`${item.id}-${index}`} className="inline-flex items-center gap-3">
            <span className="size-2 rounded-full bg-cyan-300" />
            {item.line}
          </span>
        ))}
      </div>
    </div>
  );
}
