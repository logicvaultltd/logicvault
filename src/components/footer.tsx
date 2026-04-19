"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { BrandLogo } from "@/components/brand-logo";
import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  getDictionary,
  getLocaleFromPathname,
  localizePath,
  persistLocalePreference,
  resolveLocale,
} from "@/lib/i18n";

type FooterLink = {
  href: string;
  label: string;
};

const FOOTER_COLUMNS: Array<{
  title: string;
  links: FooterLink[];
}> = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/#tools", label: "Tools" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/tool/statement-to-csv", label: "Account Statement to CSV" },
      { href: "/tool/merge-pdf", label: "Merge PDF" },
      { href: "/tool/yield-calculator", label: "Yield Calculator" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/trust", label: "Trust" },
      { href: "/security", label: "Security" },
      { href: "/compliance", label: "Compliance" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const siteConfig = useGlobalSiteConfig();
  const activeLocale = getLocaleFromPathname(pathname);
  const copy = getDictionary(activeLocale);
  const unlocalizedPath = activeLocale
    ? pathname.replace(new RegExp(`^/${activeLocale}`), "") || "/"
    : pathname || "/";
  const enabledLocales = SUPPORTED_LOCALES.filter((locale) =>
    siteConfig.enabledLanguages.includes(locale)
  );
  const localeOptions = enabledLocales.length > 0 ? enabledLocales : SUPPORTED_LOCALES;

  return (
    <footer className="lv-footer-shell">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <AdSlot slot="stickyFooter" className="mb-10" label="Ad Placement" />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="min-w-0">
                <BrandLogo
                  size={48}
                  textClassName="text-white"
                  className="items-center"
                  markClassName="rounded-[16px] border-white/15 bg-white/5"
                />
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-300">
                  Private financial tools, clean document workflows, and global-first utility
                  design for modern teams.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={localizePath("/contact", activeLocale)}
                className="lv-button-primary inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition hover:translate-y-[-1px]"
              >
                {copy.contact}
              </Link>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
                Global
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Private by design
              </span>
            </div>

            <label className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 backdrop-blur-sm">
              <span aria-hidden="true">🌐</span>
              <select
                className="bg-transparent text-sm font-medium uppercase tracking-[0.18em] text-slate-100 outline-none"
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
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={localizePath(link.href, activeLocale)}
                      className="text-slate-300 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lv-divider mt-10 flex flex-col gap-4 border-t pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.safeFooter}</p>
          <p>© 2026 Logic Vault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
