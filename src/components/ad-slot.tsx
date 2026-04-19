"use client";

import { useEffect, useRef, useState } from "react";

import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import { AD_SLOT_DEFINITIONS, type AdSlotName } from "@/lib/ad-slots";

interface AdSlotProps {
  slot: AdSlotName;
  className?: string;
  label?: string;
}

export function AdSlot({ slot, className = "", label }: AdSlotProps) {
  const { adSlots } = useGlobalSiteConfig();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slotConfig = adSlots[slot];
  const slotDetails = AD_SLOT_DEFINITIONS[slot];
  const hasCreative = Boolean(slotConfig?.script.trim());

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  if (!slotConfig?.enabled || !hasCreative) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`lv-ad-shell rounded-[24px] p-4 text-center ${className}`}
    >
      <p className="lv-text-muted text-[11px] font-semibold uppercase tracking-[0.28em]">
        {label ?? slotDetails.label}
      </p>

      {isVisible ? (
        slotConfig.script && process.env.NODE_ENV === "production" ? (
          <div
            className="mt-3 min-h-[90px]"
            dangerouslySetInnerHTML={{ __html: slotConfig.script }}
          />
        ) : (
          <div className="lv-ad-placeholder lv-text-muted mt-3 rounded-2xl px-4 py-8 text-sm">
            {slotDetails.label} is reserved and will activate when a sponsor is live.
          </div>
        )
      ) : (
        <div className="mt-3 h-[120px] animate-pulse rounded-2xl bg-[color:var(--ad-placeholder-background)]" />
      )}
    </div>
  );
}
