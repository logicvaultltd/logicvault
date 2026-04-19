"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ShieldCheck, Upload } from "lucide-react";

import { AdSlot } from "@/components/ad-slot";
import { ProcessingStatus } from "@/components/processing-status";
import { VaultInput } from "@/components/ui/vault-input";
import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import { useVaultContext } from "@/context/vault-context";
import { getDictionary, getLocaleFromPathname, localizePath } from "@/lib/i18n";
import { IconByName, getAccentClasses } from "@/lib/icon-map";
import { toVaultErrorMessage } from "@/lib/error-copy";
import { getProviderMaintenanceMessage, isProviderAvailable } from "@/lib/provider-status";
import { recordSuccessfulToolRun } from "@/lib/trustpilot";
import type { ToolDefinition } from "@/lib/tools-registry";

const JsonTreeView = dynamic(
  () => import("@/components/json-tree-view").then((module) => module.JsonTreeView),
  { ssr: false }
);
const RatingModal = dynamic(
  () => import("@/components/rating-modal").then((module) => module.RatingModal),
  { ssr: false }
);

interface WorkstationProps {
  tool: ToolDefinition;
}

type ProcessingState = "idle" | "uploading" | "processing" | "ready" | "error";

function getInitialValues(tool: ToolDefinition) {
  return tool.inputs.reduce<Record<string, string>>((accumulator, input) => {
    accumulator[input.name] = "";
    return accumulator;
  }, {});
}

function readFilename(headers: Headers) {
  const disposition = headers.get("content-disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "logivault.org_output";
}

export function Workstation({ tool }: WorkstationProps) {
  const pathname = usePathname();
  const activeLocale = getLocaleFromPathname(pathname);
  const copy = getDictionary(activeLocale);
  const siteConfig = useGlobalSiteConfig();
  const { rememberTool } = useVaultContext();
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    getInitialValues(tool)
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [downloadInfo, setDownloadInfo] = useState<{ filename: string; url: string } | null>(null);
  const lastRememberedToolId = useRef<string | null>(null);
  const downloadUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null
  >(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accent = getAccentClasses(tool.accent);
  const providerAvailable = isProviderAvailable(tool.provider, siteConfig.apiStatus);

  useEffect(() => {
    if (lastRememberedToolId.current === tool.id) {
      return;
    }

    rememberTool(tool.id);
    lastRememberedToolId.current = tool.id;
  }, [rememberTool, tool.id]);

  useEffect(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }

    setFormValues(getInitialValues(tool));
    setSelectedFiles([]);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(null);
    setTextPreview(null);
    setShareUrl(null);
    setShareMessage(null);
    setIsDragging(false);
    setDownloadInfo(null);
    setShowRatingModal(false);
  }, [tool]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }

      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  const missingRequiredInput = useMemo(
    () => tool.inputs.find((input) => input.required && !(formValues[input.name] ?? "").trim()),
    [formValues, tool.inputs]
  );
  const hasFiles = selectedFiles.length > 0;
  const formIntro = useMemo(() => {
    if (tool.category === "Developer Tools") {
      return {
        title: "Paste developer data and shape the output instantly.",
        body: "Use the editor below to validate, transform, inspect, or generate clean code-friendly output without leaving the browser.",
      };
    }

    return {
      title: "Enter the values below to calculate your result.",
      body: "This tool works instantly with the numbers you provide. No upload needed.",
    };
  }, [tool.category]);
  const parsedTreePreview = useMemo(() => {
    if (tool.resultPreview !== "json-tree" || !textPreview) {
      return null;
    }

    try {
      return JSON.parse(textPreview) as unknown;
    } catch {
      return null;
    }
  }, [textPreview, tool.resultPreview]);

  const updateValue = (name: string, value: string) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openPrimaryAction = () => {
    fileInputRef.current?.click();
  };

  const startProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    setProgress(12);
    progressTimerRef.current = setInterval(() => {
      setProgress((current) => (current >= 84 ? current : current + 8));
    }, 180);
  };

  const stopProgress = (nextProgress: number) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    setProgress(nextProgress);
  };

  const updateSelectedFiles = (incomingFiles: File[]) => {
    setSelectedFiles(tool.allowsMultipleFiles ? incomingFiles : incomingFiles.slice(0, 1));
    setErrorMessage(null);
    setStatus("idle");
    setProgress(0);
    setTextPreview(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSelectedFiles(Array.from(event.target.files ?? []));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    updateSelectedFiles(Array.from(event.dataTransfer.files ?? []));
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
    if (siteConfig.maintenanceMode) {
      setErrorMessage("The Vault encountered a secure hiccup. Please try again.");
      return;
    }

    if (!providerAvailable) {
      setErrorMessage(getProviderMaintenanceMessage(tool.provider));
      return;
    }

    if (tool.mode === "file" && !hasFiles) {
      setErrorMessage("Please choose a file first.");
      return;
    }

    if (missingRequiredInput) {
      setErrorMessage(`Please complete "${missingRequiredInput.label}".`);
      firstInputRef.current?.focus();
      return;
    }

    if (downloadInfo?.url) {
      URL.revokeObjectURL(downloadInfo.url);
      downloadUrlRef.current = null;
      setDownloadInfo(null);
    }

    setErrorMessage(null);
    setTextPreview(null);
    setShareUrl(null);
    setShareMessage(null);
    setStatus("uploading");
    startProgress();

    const stageTimer = window.setTimeout(() => {
      setStatus("processing");
    }, 240);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`/api/process/${tool.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Something went wrong while processing your request.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = readFilename(response.headers);
      const contentType = response.headers.get("content-type") ?? "";

      downloadUrlRef.current = url;
      setDownloadInfo({ filename, url });

      if (contentType.startsWith("text/") || contentType.includes("json")) {
        setTextPreview(await blob.text());
      }

      stopProgress(100);
      setStatus("ready");
      maybeOpenRatingModal();
    } catch (error) {
      stopProgress(0);
      setStatus("error");
      setErrorMessage(toVaultErrorMessage(error));
    } finally {
      window.clearTimeout(stageTimer);
    }
  };

  const handleShareReport = async () => {
    const reportType =
      tool.id === "yield-calculator"
        ? "real-estate-yield"
        : tool.id === "roi-tracker"
          ? "marketing-roi"
          : null;

    if (!reportType) {
      return;
    }

    try {
      const response = await fetch(`/api/public-reports/${reportType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: formValues }),
      });

      if (!response.ok) {
        throw new Error("Could not create the private link.");
      }

      const payload = (await response.json()) as { id: string; url: string };
      const fullUrl = `${window.location.origin}/r/${payload.id}`;
      const whatsappCaption = `Check out this ${
        reportType === "real-estate-yield" ? "yield analysis" : "marketing ROI analysis"
      } I ran on Logic Vault. ${fullUrl}`;

      await navigator.clipboard.writeText(`${fullUrl}\n\n${whatsappCaption}`);
      setShareUrl(fullUrl);
      setShareMessage("Private link copied with a WhatsApp-ready caption.");
    } catch (error) {
      setShareMessage(toVaultErrorMessage(error, "Could not create the private link."));
    }
  };

  return (
    <main className="lv-page-shell px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={localizePath("/", activeLocale)}
          className="lv-link inline-flex items-center gap-2 text-sm font-semibold transition"
        >
          <ArrowLeft className="size-4" />
          {copy.backToTools}
        </Link>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <AdSlot slot="leaderboard" label="Leaderboard" />

            <section className="lv-surface rounded-[32px] px-5 py-8 sm:px-8">
              <div className="text-center">
                <span
                  role="img"
                  aria-label={`Secure tool for ${tool.title} processing`}
                  className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${accent.icon}`}
                >
                  <IconByName
                    iconName={tool.iconName}
                    className="lv-neon-icon size-8 drop-shadow-[0_0_14px_rgba(0,229,255,0.34)]"
                  />
                  <span className="sr-only">{`Secure tool for ${tool.title} processing`}</span>
                </span>
                <h1 className="lv-text-primary mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                  {tool.title}
                </h1>
                <p className="lv-text-secondary mx-auto mt-3 max-w-2xl text-sm leading-7">
                  {tool.description}
                </p>
              </div>

              {tool.mode === "file" ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`lv-dropzone mt-8 rounded-[28px] px-6 py-10 text-center transition ${
                    isDragging
                      ? "lv-dropzone-active"
                      : ""
                  }`}
                >
                  <Upload className="mx-auto size-10 text-vault-electric" />
                  <p className="lv-text-primary mt-4 text-lg font-bold">{tool.dropHint}</p>
                  <p className="lv-text-muted mt-2 text-sm">{copy.dropFileHelp}</p>

                  <button
                    type="button"
                    onClick={openPrimaryAction}
                    className={`mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${accent.button}`}
                  >
                    {tool.buttonLabel}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={tool.fileAccept}
                    multiple={tool.allowsMultipleFiles}
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  {hasFiles ? (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {selectedFiles.map((file) => (
                        <span
                          key={`${file.name}-${file.size}`}
                          className="lv-chip lv-text-secondary rounded-full px-3 py-1 text-xs font-medium"
                        >
                          {file.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="lv-surface-inset mt-8 rounded-[28px] px-6 py-8 text-center">
                  <span
                    className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${accent.icon}`}
                  >
                    <IconByName
                      iconName={tool.iconName}
                      className="lv-neon-icon size-7 drop-shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                    />
                  </span>
                  <p className="lv-text-primary mt-4 text-lg font-bold">
                    {formIntro.title}
                  </p>
                  <p className="lv-text-muted mt-2 text-sm">
                    {formIntro.body}
                  </p>
                </div>
              )}

              <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${accent.badge}`}>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  <p>{copy.safeBadge}</p>
                </div>
              </div>

              {tool.inputs.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {tool.inputs.map((input, index) => (
                    <VaultInput
                      key={input.name}
                      input={input}
                      value={formValues[input.name] ?? ""}
                      onChange={updateValue}
                      inputRef={index === 0 ? firstInputRef : undefined}
                    />
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={
                    status === "uploading" ||
                    status === "processing" ||
                    siteConfig.maintenanceMode ||
                    !providerAvailable
                  }
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${accent.button}`}
                >
                  {status === "uploading" || status === "processing"
                    ? copy.processing
                    : `${copy.process} ${tool.title}`}
                </button>

                <ProcessingStatus
                  status={status}
                  progress={progress}
                  labels={{
                    uploading: copy.uploading,
                    processing: copy.processingApi,
                    ready: copy.downloadReady,
                  }}
                />
              </div>

              {errorMessage ? (
                <div className="lv-note-info mt-6 rounded-2xl px-4 py-3 text-sm">
                  {errorMessage.includes("PDF") ? "Oops! Please use a PDF file." : errorMessage}
                </div>
              ) : null}

              {!providerAvailable && !errorMessage ? (
                <div className="lv-note-neutral mt-6 rounded-2xl px-4 py-3 text-sm">
                  {getProviderMaintenanceMessage(tool.provider)}
                </div>
              ) : null}

              {status === "ready" && downloadInfo ? (
                <div className="mt-6 space-y-4">
                  <div className="lv-note-success rounded-[24px] px-5 py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {copy.downloadReady}
                        </p>
                        <p className="lv-text-primary mt-1 text-sm">{downloadInfo.filename}</p>
                        <p className="lv-text-muted mt-2 text-sm">
                          Review the file name, then download it when you are ready.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadAgain}
                        className="lv-button-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
                      >
                        {copy.downloadAgain}
                      </button>
                    </div>
                  </div>

                  {textPreview ? (
                    <div className="space-y-4">
                      {parsedTreePreview ? (
                        <div className="lv-surface-inset rounded-[24px] px-5 py-5 text-sm">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="lv-text-primary text-sm font-bold">Visual JSON Tree</p>
                              <p className="lv-text-muted mt-1 text-xs uppercase tracking-[0.18em]">
                                Expand the payload and inspect nested keys
                              </p>
                            </div>
                          </div>
                          <JsonTreeView value={parsedTreePreview} />
                        </div>
                      ) : null}

                      <div className="lv-surface-inset lv-text-primary rounded-[24px] px-5 py-5 text-sm">
                        <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-6">
                          {textPreview}
                        </pre>
                      </div>
                    </div>
                  ) : null}

                  {tool.id === "yield-calculator" || tool.id === "roi-tracker" ? (
                    <div className="lv-surface rounded-[24px] px-5 py-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="lv-text-primary text-sm font-semibold">Generate Private Link</p>
                          <p className="lv-text-muted mt-1 text-sm">
                            Copy a branded calculator URL and WhatsApp-ready caption.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleShareReport}
                          className="lv-button-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
                        >
                          Generate Private Link
                        </button>
                      </div>

                      {shareUrl ? (
                        <div className="lv-note-success mt-4 rounded-2xl px-4 py-3 text-sm">
                          <p>{shareMessage}</p>
                          <p className="lv-text-primary mt-2 break-all">{shareUrl}</p>
                        </div>
                      ) : shareMessage ? (
                        <div className="lv-surface-inset lv-text-secondary mt-4 rounded-2xl px-4 py-3 text-sm">
                          {shareMessage}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <AdSlot slot="action" label="Post-task Sponsor" className="mt-[52px]" />
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-6 xl:pt-[108px]">
            <AdSlot slot="engagement" label="Engagement Zone" />

            <div className="lv-surface rounded-[28px] p-5">
              <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
                Safe & Secure
              </p>
              <p className="lv-text-secondary mt-3 text-sm leading-7">
                Your files stay local by default. When cloud-assisted tools are enabled, Logic
                Vault only keeps the data long enough to finish the task and prepare your file
                for download.
              </p>
            </div>
          </aside>
        </div>

        <p className="lv-text-muted mt-6 text-center text-sm">{copy.safeFooter}</p>
      </div>

      <RatingModal
        locale={activeLocale}
        visitCount={visitCount}
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
      />
    </main>
  );
}
