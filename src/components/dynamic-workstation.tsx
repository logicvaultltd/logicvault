"use client";

import dynamic from "next/dynamic";

import type { ToolDefinition } from "@/lib/tools-registry";

function WorkstationLoading() {
  return (
    <main className="lv-page-shell px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="lv-surface rounded-[32px] px-5 py-12 text-center sm:px-8">
          <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
            Preparing secure workspace
          </p>
          <div className="mx-auto mt-6 h-3 max-w-sm overflow-hidden rounded-full bg-[color:var(--status-background)]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[color:var(--vault-electric)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export const DynamicWorkstation = dynamic<{ tool: ToolDefinition }>(
  () => import("@/components/workstation").then((module) => module.Workstation),
  {
    ssr: false,
    loading: WorkstationLoading,
  }
);
