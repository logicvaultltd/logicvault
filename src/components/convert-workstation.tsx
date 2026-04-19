"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Upload } from "lucide-react";

import { AdSlot } from "@/components/ad-slot";
import { ProcessingStatus } from "@/components/processing-status";
import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import { toVaultErrorMessage } from "@/lib/error-copy";
import { getAccentClasses } from "@/lib/icon-map";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";
import { recordSuccessfulToolRun } from "@/lib/trustpilot";

const RatingModal = dynamic(
  () => import("@/components/rating-modal").then((module) => module.RatingModal),
  { ssr: false }
);

interface ConvertWorkstationProps {
  bankName: string;
  slug: string;
  targetLabel: string;
  targetFormat: string;
  relatedHref: string;
  relatedLabel: string;
}

type ProcessingState = "idle" | "uploading" | "processing" | "ready" | "error";

function readFilename(headers: Headers) {
  const disposition = headers.get("content-disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "logivault.org_output";
}

export function ConvertWorkstation({
  bankName,
  slug,
  targetLabel,
  targetFormat,
  relatedHref,
  relatedLabel,
}: ConvertWorkstationProps) {
  const pathname = usePathname();
  const activeLocale = getLocaleFromPathname(pathname);
  const copy = getDictionary(activeLocale);
  const siteConfig = useGlobalSiteConfig();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{ filename: string; url: string } | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accent = getAccentClasses("red");

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();

      if (downloadInfo?.url) {
        URL.revokeObjectURL(downloadInfo.url);
      }
    };
  }, [downloadInfo]);

  const startProgress = () => {
    clearTimer();
    setProgress(10);
    timerRef.current = setInterval(() => {
      setProgress((current) => (current >= 88 ? current : current + 9));
    }, 180);
  };

  const downloadAgain = () => {
    if (!downloadInfo) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = downloadInfo.url;
    anchor.download = downloadInfo.filename;
    anchor.click();
  };

  const maybeOpenRatingModal = () => {
    const { visitCount: nextCount, shouldPrompt } = recordSuccessfulToolRun();
    setVisitCount(nextCount);
    setShowRatingModal(shouldPrompt);
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setErrorMessage("Please choose an account statement PDF first.");
      return;
    }

    if (siteConfig.maintenanceMode) {
      setErrorMessage("The Vault encountered a secure hiccup. Please try again.");
      return;
    }

    setErrorMessage(null);
    if (downloadInfo?.url) {
      URL.revokeObjectURL(downloadInfo.url);
      setDownloadInfo(null);
    }
    setStatus("uploading");
    startProgress();

    const stageTimer = window.setTimeout(() => {
      setStatus("processing");
    }, 250);

    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("statement_type", "Checking");
      formData.append("export_format", targetFormat);
      formData.append("referrer_slug", slug);

      const response = await fetch("/api/process/statement-to-csv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "We could not convert this statement.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = readFilename(response.headers);
      setDownloadInfo({ filename, url });
      clearTimer();
      setProgress(100);
      setStatus("ready");
      maybeOpenRatingModal();
    } catch (error) {
      clearTimer();
      setProgress(0);
      setStatus("error");
      setErrorMessage(toVaultErrorMessage(error, "We could not convert this statement."));
    } finally {
      window.clearTimeout(stageTimer);
    }
  };

  return (
    <div className="space-y-6">
      <AdSlot slot="leaderboard" label="Conversion Sponsor" />

      <section className="lv-surface rounded-[32px] px-5 py-8 sm:px-8">
        <div className="text-center">
          <span className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${accent.icon}`}>
            <Upload className="lv-neon-icon size-8 drop-shadow-[0_0_14px_rgba(0,229,255,0.34)]" />
          </span>
          <h1 className="lv-text-primary mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Convert {bankName} PDF to {targetLabel} | Free Online Tool
          </h1>
          <p className="lv-text-secondary mx-auto mt-3 max-w-2xl text-sm leading-7">
            Upload your {bankName} statement and export it into clean {targetLabel} rows with the
            Logic Vault account statement engine.
          </p>
        </div>

        <div className="lv-dropzone mt-8 rounded-[28px] px-6 py-10 text-center">
          <Upload className="mx-auto size-10 text-vault-electric" />
          <p className="lv-text-primary mt-4 text-lg font-bold">
            Drop your {bankName} statement here
          </p>
          <p className="lv-text-muted mt-2 text-sm">
            PDF only. We will convert it into {targetLabel} and prepare a branded file for you to
            download when you are ready.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${accent.button}`}
          >
            Select Account Statement
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="sr-only"
          />

          {selectedFile ? (
            <div className="lv-chip lv-text-secondary mt-5 inline-flex rounded-full px-3 py-1 text-xs font-medium">
              {selectedFile.name}
            </div>
          ) : null}
        </div>

        <div className="lv-note-info mt-5 rounded-2xl px-4 py-3 text-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <p>
              No account data is stored on our servers. Downloads are branded as
              <strong> logivault.org_*</strong> for consistent offline sharing.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleProcess}
            disabled={status === "uploading" || status === "processing"}
            className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${accent.button}`}
          >
            {status === "uploading" || status === "processing"
              ? "Converting..."
              : `Convert to ${targetLabel}`}
          </button>

          <ProcessingStatus
            status={status}
            progress={progress}
            labels={{
              uploading: copy.uploading,
              processing: copy.processingApi,
              ready: "Download ready",
            }}
          />
        </div>

        {errorMessage ? (
          <div className="lv-note-info mt-6 rounded-2xl px-4 py-3 text-sm">
            {errorMessage}
          </div>
        ) : null}

        {downloadInfo ? (
          <div className="mt-6 space-y-4">
            <div className="lv-note-success rounded-[24px] px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Download Ready</p>
                  <p className="lv-text-primary mt-1 text-sm">{downloadInfo.filename}</p>
                  <p className="lv-text-muted mt-2 text-sm">
                    Your file is prepared. Click below whenever you want to save it.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadAgain}
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${accent.button}`}
                >
                  {copy.downloadAgain}
                </button>
              </div>
            </div>
            <AdSlot slot="action" label="After Download" className="mt-[52px]" />
          </div>
        ) : null}

        <div className="lv-divider mt-8 flex flex-col items-center gap-3 border-t pt-6">
          <p className="lv-text-muted text-sm">Need a different format?</p>
          <Link
            href={relatedHref}
            className="lv-button-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Try {relatedLabel} instead
          </Link>
        </div>
      </section>

      <RatingModal
        locale={activeLocale}
        visitCount={visitCount}
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
      />
    </div>
  );
}
