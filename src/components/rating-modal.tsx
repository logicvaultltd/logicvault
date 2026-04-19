"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";

import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { markTrustpilotCompleted } from "@/lib/trustpilot";

interface RatingModalProps {
  locale: string | null;
  visitCount: number;
  open: boolean;
  onClose: () => void;
}

export function RatingModal({
  locale,
  visitCount,
  open,
  onClose,
}: RatingModalProps) {
  const config = useGlobalSiteConfig();
  const copy = getDictionary(resolveLocale(locale));
  const title = useMemo(
    () => (visitCount >= 10 ? copy.rateTenth : copy.rateFirst),
    [copy.rateFirst, copy.rateTenth, visitCount]
  );

  if (!open || !config.ratingModalEnabled) {
    return null;
  }

  return (
    <div className="lv-modal-backdrop fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="lv-modal-shell w-full max-w-md rounded-[28px] p-6">
        <div className="flex items-center gap-3">
          <span className="lv-neon-icon-shell lv-neon-cobalt flex size-12 items-center justify-center rounded-2xl text-vault-electric">
            <Star className="size-6" />
          </span>
          <div>
            <p className="lv-text-primary text-lg font-black">{title}</p>
            <p className="lv-text-muted mt-1 text-sm">{copy.rateSupport}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={config.trustpilotUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              markTrustpilotCompleted();
              onClose();
            }}
            className="lv-button-primary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Trustpilot
          </a>
          <button
            type="button"
            onClick={onClose}
            className="lv-button-secondary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
