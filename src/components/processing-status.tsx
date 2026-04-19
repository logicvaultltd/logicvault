"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";

type ProcessingState = "idle" | "uploading" | "processing" | "ready" | "error";

interface ProcessingStatusProps {
  status: ProcessingState;
  progress: number;
  labels: {
    uploading: string;
    processing: string;
    ready: string;
  };
}

export function ProcessingStatus({
  status,
  progress,
  labels,
}: ProcessingStatusProps) {
  if (status === "idle" || status === "error") {
    return null;
  }

  return (
    <div className="lv-status-shell w-full rounded-2xl px-4 py-4">
      <div className="lv-text-secondary flex items-center justify-between text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          {status === "ready" ? (
            <CheckCircle2 className="size-4 text-vault-lime" />
          ) : (
            <LoaderCircle className="size-4 animate-spin text-vault-electric" />
          )}
          {status === "uploading"
            ? labels.uploading
            : status === "processing"
              ? labels.processing
              : labels.ready}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="lv-status-track mt-3 h-2 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-[#10B981] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
