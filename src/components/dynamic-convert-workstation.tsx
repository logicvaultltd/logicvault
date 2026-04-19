"use client";

import dynamic from "next/dynamic";

interface ConvertWorkstationProps {
  bankName: string;
  slug: string;
  targetLabel: string;
  targetFormat: string;
  relatedHref: string;
  relatedLabel: string;
}

function ConvertWorkstationLoading() {
  return (
    <div className="lv-surface rounded-[32px] px-5 py-12 text-center sm:px-8">
      <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
        Loading conversion vault
      </p>
      <div className="mx-auto mt-6 h-3 max-w-sm overflow-hidden rounded-full bg-[color:var(--status-background)]">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-[color:var(--vault-electric)]" />
      </div>
    </div>
  );
}

export const DynamicConvertWorkstation = dynamic<ConvertWorkstationProps>(
  () =>
    import("@/components/convert-workstation").then(
      (module) => module.ConvertWorkstation
    ),
  {
    ssr: false,
    loading: ConvertWorkstationLoading,
  }
);
