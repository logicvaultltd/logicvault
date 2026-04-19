"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import { InstallAppButton } from "@/components/install-app-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  getDictionary,
  getLocaleFromPathname,
  localizePath,
  persistLocalePreference,
  resolveLocale,
} from "@/lib/i18n";

const NAV_TOOL_GROUPS = [
  {
    title: "Organize",
    tools: [
      { id: "merge-pdf", title: "Merge PDF" },
      { id: "split-pdf", title: "Split PDF" },
      { id: "organize-pdf", title: "Organize PDF" },
      { id: "remove-pages", title: "Remove Pages" },
    ],
  },
  {
    title: "Optimize",
    tools: [
      { id: "compress-pdf", title: "Compress PDF" },
      { id: "repair-pdf", title: "Repair PDF" },
    ],
  },
  {
    title: "Convert",
    tools: [
      { id: "word-to-pdf", title: "Word to PDF" },
      { id: "excel-to-pdf", title: "Excel to PDF" },
      { id: "ppt-to-pdf", title: "PPT to PDF" },
      { id: "jpg-to-pdf", title: "JPG to PDF" },
      { id: "html-to-pdf", title: "HTML to PDF" },
      { id: "pdf-to-word", title: "PDF to Word" },
      { id: "pdf-to-excel", title: "PDF to Excel" },
      { id: "pdf-to-ppt", title: "PDF to PPT" },
      { id: "pdf-to-jpg", title: "PDF to JPG" },
      { id: "pdf-to-pdfa", title: "PDF to PDF/A" },
    ],
  },
  {
    title: "Security",
    tools: [
      { id: "unlock-pdf", title: "Unlock PDF" },
      { id: "protect-pdf", title: "Protect PDF" },
      { id: "sign-pdf", title: "Sign PDF" },
      { id: "redact-pdf", title: "Redact PDF" },
    ],
  },
  {
    title: "PDF Tools",
    tools: [
      { id: "compare-pdf", title: "Compare PDF" },
      { id: "redact-pdf", title: "Redact PDF" },
      { id: "crop-pdf", title: "Crop PDF" },
      { id: "scan-to-pdf", title: "Scan to PDF" },
      { id: "rotate-pdf", title: "Rotate PDF" },
      { id: "page-numbers", title: "Page Numbers" },
      { id: "watermark-pdf", title: "Watermark PDF" },
      { id: "edit-pdf", title: "Edit PDF" },
    ],
  },
  {
    title: "Intelligence",
    tools: [
      { id: "statement-to-csv", title: "Account Statement to CSV" },
      { id: "ai-summarizer", title: "AI Summarizer" },
      { id: "translate-pdf", title: "Translate PDF" },
      { id: "ocr-pdf", title: "OCR PDF" },
      { id: "ai-expense-categorizer", title: "AI Expense Categorizer" },
      { id: "financial-health-score", title: "Financial Health Score" },
    ],
  },
  {
    title: "Developer Tools",
    tools: [
      { id: "json-universal-converter", title: "JSON Universal Converter" },
      { id: "json-formatter-validator", title: "JSON Formatter Validator" },
      { id: "json-to-typescript-interface", title: "JSON to TypeScript Interface" },
      { id: "json-minifier", title: "JSON Minifier" },
      { id: "json-tree-viewer", title: "JSON Tree Viewer" },
      { id: "base64-encoder", title: "Base64 Encoder" },
      { id: "jwt-debugger", title: "JWT Debugger" },
    ],
  },
  {
    title: "Financial Tools",
    tools: [
      { id: "yield-calculator", title: "Yield Calculator" },
      { id: "roi-tracker", title: "ROI Tracker" },
      { id: "landed-cost-calculator", title: "Landed Cost Calculator" },
      { id: "marketing-budget-tool", title: "Marketing Budget Tool" },
      { id: "tax-estimator", title: "Tax Estimator" },
      { id: "business-valuation-tool", title: "Business Valuation Tool" },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const siteConfig = useGlobalSiteConfig();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);
  const activeLocale = getLocaleFromPathname(pathname);
  const copy = getDictionary(activeLocale);
  const unlocalizedPath = activeLocale
    ? pathname.replace(new RegExp(`^/${activeLocale}`), "") || "/"
    : pathname || "/";
  const localeOptions = useMemo(() => {
    const enabledLocales = SUPPORTED_LOCALES.filter((locale) =>
      siteConfig.enabledLanguages.includes(locale)
    );

    return enabledLocales.length > 0 ? enabledLocales : SUPPORTED_LOCALES;
  }, [siteConfig.enabledLanguages]);
  const closeMenus = useCallback(() => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
    setMobileToolsOpen(false);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        toolsMenuRef.current &&
        event.target instanceof Node &&
        !toolsMenuRef.current.contains(event.target)
      ) {
        setToolsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setToolsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      closeMenus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [closeMenus, pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileMenuOpen]);

  const languagePicker = (
    <label className="lv-header-control inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm">
      <span aria-hidden="true">🌐</span>
      <select
        className="max-w-[190px] bg-transparent font-medium uppercase tracking-[0.14em] lv-text-primary outline-none"
        value={activeLocale ?? "en"}
        onChange={(event) => {
          const nextLocale = resolveLocale(event.target.value);
          persistLocalePreference(nextLocale);
          window.location.href = localizePath(unlocalizedPath, nextLocale);
        }}
      >
        {localeOptions.map((locale) => (
          <option key={locale} value={locale}>
            {LOCALE_LABELS[locale].toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <header className="lv-header-shell fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={localizePath("/", activeLocale)}
          onClick={closeMenus}
          className="flex items-center"
        >
          <BrandLogo
            size={40}
            priority
            textClassName="lv-text-primary"
            className="items-center"
          />
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="lv-header-control inline-flex size-12 items-center justify-center rounded-2xl border transition md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          <Link
            href={localizePath("/", activeLocale)}
            onClick={closeMenus}
            className="lv-link transition"
          >
            {copy.home}
          </Link>
          <div
            ref={toolsMenuRef}
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setToolsOpen((current) => !current)}
              aria-expanded={toolsOpen}
              className="lv-link inline-flex items-center gap-1.5 transition"
            >
              {copy.tools}
              <ChevronDown
                className={`size-4 transition ${toolsOpen ? "rotate-180 lv-text-primary" : ""}`}
              />
            </button>
            <div
              className={`absolute right-0 top-full z-50 w-[min(92vw,760px)] pt-3 transition duration-200 ${
                toolsOpen
                  ? "visible translate-y-0 opacity-100"
                  : "pointer-events-none invisible -translate-y-1 opacity-0"
              }`}
            >
              <div className="lv-menu-shell rounded-[28px] p-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {NAV_TOOL_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
                        {group.title}
                      </p>
                      <div className="mt-3 space-y-2">
                        {group.tools.map((tool) => (
                          <Link
                            key={tool.id}
                            href={localizePath(`/tool/${tool.id}`, activeLocale)}
                            onClick={closeMenus}
                            className="lv-interactive-row block rounded-2xl px-3 py-2 text-sm transition"
                          >
                            {tool.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link
            href={localizePath("/about", activeLocale)}
            onClick={closeMenus}
            className="lv-link transition"
          >
            {copy.about}
          </Link>
          <ThemeToggle onToggle={() => setToolsOpen(false)} />
          <Link
            href={localizePath("/contact", activeLocale)}
            onClick={closeMenus}
            className="lv-button-primary inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            {copy.contact}
          </Link>
          {languagePicker}
        </nav>
      </div>

      {mobileMenuOpen ? (
        <div className="lv-mobile-overlay fixed inset-0 z-40 md:hidden">
          <div className="flex min-h-full flex-col px-4 pb-6 pt-20">
            <div className="lv-mobile-sheet mx-auto w-full max-w-xl rounded-[32px] p-5">
              <div className="lv-divider flex items-center justify-between border-b pb-5">
                <Link
                  href={localizePath("/", activeLocale)}
                  onClick={closeMenus}
                  className="flex items-center"
                >
                  <BrandLogo size={40} textClassName="lv-text-primary" className="items-center" />
                </Link>
                <button
                  type="button"
                  onClick={closeMenus}
                  className="lv-header-control inline-flex size-11 items-center justify-center rounded-2xl border text-white/90 transition"
                  aria-label="Close mobile menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="mt-5 space-y-5 text-sm font-semibold">
                <div className="space-y-2">
                  <p className="lv-eyebrow px-2 text-xs font-semibold uppercase tracking-[0.24em]">
                    Tools
                  </p>
                  <div className="lv-surface-inset rounded-[24px] p-3">
                    <Link
                      href={localizePath("/", activeLocale)}
                      onClick={closeMenus}
                      className="lv-interactive-row flex min-h-12 items-center rounded-2xl px-4 text-base transition"
                    >
                      Browse all tools
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileToolsOpen((current) => !current)}
                      aria-expanded={mobileToolsOpen}
                      className="lv-interactive-row lv-divider mt-2 flex min-h-12 w-full items-center justify-between rounded-2xl border-t px-4 text-left text-sm font-semibold transition"
                    >
                      <span>Open full tool library</span>
                      <ChevronDown
                        className={`size-4 transition ${mobileToolsOpen ? "rotate-180 lv-text-primary" : ""}`}
                      />
                    </button>
                    {mobileToolsOpen ? (
                      <div className="lv-divider mt-2 space-y-4 border-t pt-4">
                        {NAV_TOOL_GROUPS.map((group) => (
                          <div key={group.title}>
                            <p className="lv-text-muted px-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                              {group.title}
                            </p>
                            <div className="mt-2">
                              {group.tools.map((tool) => (
                                <Link
                                  key={tool.id}
                                  href={localizePath(`/tool/${tool.id}`, activeLocale)}
                                  onClick={closeMenus}
                                  className="lv-interactive-row lv-divider flex min-h-12 items-center border-t px-4 text-sm transition first:border-t-0"
                                >
                                  {tool.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="lv-eyebrow px-2 text-xs font-semibold uppercase tracking-[0.24em]">
                    Company
                  </p>
                  <div className="lv-surface-inset rounded-[24px] p-3">
                    <Link
                      href={localizePath("/about", activeLocale)}
                      onClick={closeMenus}
                      className="lv-interactive-row flex min-h-12 items-center rounded-2xl px-4 text-base transition"
                    >
                      {copy.about}
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="lv-eyebrow px-2 text-xs font-semibold uppercase tracking-[0.24em]">
                    Support
                  </p>
                  <div className="lv-surface-inset rounded-[24px] p-3">
                    <div className="mb-4">
                      <ThemeToggle compact onToggle={closeMenus} />
                    </div>
                    <div className="mb-3">
                      <InstallAppButton onInstalled={closeMenus} />
                    </div>
                    <Link
                      href={localizePath("/contact", activeLocale)}
                      onClick={closeMenus}
                      className="lv-button-primary flex min-h-12 items-center justify-center rounded-2xl px-4 text-base font-semibold transition"
                    >
                      {copy.contact}
                    </Link>
                    <div className="mt-4 px-1">{languagePicker}</div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
