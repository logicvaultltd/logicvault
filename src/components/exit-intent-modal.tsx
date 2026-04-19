"use client";

import { useEffect, useState } from "react";

import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getSuccessfulToolRunCount, markTrustpilotCompleted } from "@/lib/trustpilot";

const EXIT_INTENT_KEY = "logic-vault:exit-intent-dismissed";

export function ExitIntentModal({ locale }: { locale: string | null }) {
  const config = useGlobalSiteConfig();
  const copy = getDictionary(resolveLocale(locale));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!config.exitIntentEnabled) {
      return;
    }

    if (window.localStorage.getItem(EXIT_INTENT_KEY) === "true") {
      return;
    }

    if (getSuccessfulToolRunCount() < 1) {
      return;
    }

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 20) {
        return;
      }

      setOpen(true);
    };

    window.addEventListener("mouseout", handleMouseLeave);

    return () => window.removeEventListener("mouseout", handleMouseLeave);
  }, [config.exitIntentEnabled]);

  if (!open || !config.exitIntentEnabled) {
    return null;
  }

  return (
    <div className="lv-modal-backdrop fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="lv-modal-shell w-full max-w-lg rounded-[28px] p-6">
        <h2 className="lv-text-primary text-2xl font-black">{copy.exitIntentTitle}</h2>
        <p className="lv-text-muted mt-3 text-sm leading-7">
          {config.exitIntentMessage || copy.exitIntentBody}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={config.trustpilotUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              markTrustpilotCompleted();
              window.localStorage.setItem(EXIT_INTENT_KEY, "true");
              setOpen(false);
            }}
            className="lv-button-primary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            {copy.exitIntentPrimary}
          </a>
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem(EXIT_INTENT_KEY, "true");
              setOpen(false);
            }}
            className="lv-button-secondary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            {copy.exitIntentSecondary}
          </button>
        </div>
      </div>
    </div>
  );
}
