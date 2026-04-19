export const SUPPORTED_LOCALES = [
  "en",
  "es",
  "fr",
  "pt",
  "zh",
  "ar",
  "de",
  "hi",
  "it",
  "ja",
  "nl",
  "id",
  "ko",
  "tr",
] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE_NAME = "lv-locale";
export const LOCALE_PROMPT_DISMISS_KEY = "lv-language-prompt-dismissed";

export const HREFLANG_BY_LOCALE: Record<AppLocale, string[]> = {
  en: ["en-US", "en-GB"],
  es: ["es-ES"],
  fr: ["fr-FR"],
  pt: ["pt-BR", "pt-PT"],
  zh: ["zh-CN"],
  ar: ["ar-SA"],
  de: ["de-DE"],
  hi: ["hi-IN"],
  it: ["it-IT"],
  ja: ["ja-JP"],
  nl: ["nl-NL"],
  id: ["id-ID"],
  ko: ["ko-KR"],
  tr: ["tr-TR"],
};

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  zh: "Chinese",
  ar: "Arabic",
  de: "German",
  hi: "Hindi",
  it: "Italian",
  ja: "Japanese",
  nl: "Dutch",
  id: "Indonesian",
  ko: "Korean",
  tr: "Turkish",
};

export function isSupportedLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function resolveLocale(value?: string | null): AppLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }

  return DEFAULT_LOCALE;
}

function normalizeLocaleToken(value: string) {
  return value.trim().toLowerCase().split(";")[0]?.split("-")[0] ?? "";
}

export function detectPreferredLocale(
  input: string | string[] | null | undefined,
  enabledLocales: readonly AppLocale[] = SUPPORTED_LOCALES
) {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];

  for (const value of values) {
    const locale = normalizeLocaleToken(value);

    if (isSupportedLocale(locale) && enabledLocales.includes(locale)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}
