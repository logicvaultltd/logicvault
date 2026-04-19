"use client";

import { Languages, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useGlobalSiteConfig } from "@/components/global-ad-provider";
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALE_PROMPT_DISMISS_KEY,
  SUPPORTED_LOCALES,
  detectPreferredLocale,
  getLocaleFromPathname,
  localizePath,
  persistLocalePreference,
  resolveLocale,
  type AppLocale,
} from "@/lib/i18n";

export function LanguageSuggestion() {
  const pathname = usePathname();
  const siteConfig = useGlobalSiteConfig();
  const [browserState, setBrowserState] = useState<{
    preferredLocale: AppLocale | null;
    dismissedLocale: string | null;
  }>({
    preferredLocale: null,
    dismissedLocale: null,
  });
  const activeLocale = getLocaleFromPathname(pathname);
  const enabledLocales = useMemo(
    () =>
      SUPPORTED_LOCALES.filter((locale) => siteConfig.enabledLanguages.includes(locale)),
    [siteConfig.enabledLanguages]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const preferred = detectPreferredLocale(
        navigator.languages?.length ? [...navigator.languages] : navigator.language,
        enabledLocales.length > 0 ? enabledLocales : SUPPORTED_LOCALES
      );
      const dismissedLocale = window.localStorage.getItem(LOCALE_PROMPT_DISMISS_KEY);

      setBrowserState({
        preferredLocale: preferred,
        dismissedLocale,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [enabledLocales]);

  const currentLocale = activeLocale ?? DEFAULT_LOCALE;
  const dismissed = browserState.dismissedLocale === browserState.preferredLocale;

  if (
    !browserState.preferredLocale ||
    browserState.preferredLocale === currentLocale ||
    dismissed
  ) {
    return null;
  }

  const preferredLocale = browserState.preferredLocale;

  const unlocalizedPath = activeLocale
    ? pathname.replace(new RegExp(`^/${activeLocale}`), "") || "/"
    : pathname || "/";

  const switchToPreferred = () => {
    persistLocalePreference(preferredLocale);
    window.localStorage.removeItem(LOCALE_PROMPT_DISMISS_KEY);
    window.location.href = localizePath(unlocalizedPath, resolveLocale(preferredLocale));
  };

  const keepCurrentLanguage = () => {
    persistLocalePreference(currentLocale);
    window.localStorage.setItem(
      LOCALE_PROMPT_DISMISS_KEY,
      preferredLocale
    );
    setBrowserState((current) => ({
      ...current,
      dismissedLocale: current.preferredLocale,
    }));
  };

  return (
    <div className="fixed inset-x-0 top-[78px] z-40 px-4 sm:px-6 lg:px-8">
      <div className="lv-modal-shell mx-auto flex max-w-6xl flex-col gap-3 rounded-[24px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="lv-neon-icon-shell lv-neon-cobalt inline-flex size-10 items-center justify-center rounded-2xl text-vault-electric">
            <Languages className="size-5" />
          </span>
          <div>
            <p className="lv-text-primary text-sm font-semibold">
              Would you like Logic Vault in {LOCALE_LABELS[preferredLocale]}?
            </p>
            <p className="lv-text-muted mt-1 text-sm">
              We detected your browser language and can switch the interface for you.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={switchToPreferred}
            className="lv-button-primary rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Translate to {LOCALE_LABELS[preferredLocale]}
          </button>
          <button
            type="button"
            onClick={keepCurrentLanguage}
            className="lv-header-control rounded-full border px-4 py-2 text-sm font-semibold transition"
          >
            Keep {LOCALE_LABELS[currentLocale]}
          </button>
          <button
            type="button"
            onClick={keepCurrentLanguage}
            className="lv-header-control inline-flex size-10 items-center justify-center rounded-full border transition"
            aria-label="Dismiss language suggestion"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
