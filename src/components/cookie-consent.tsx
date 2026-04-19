"use client";

import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getLocaleFromPathname, localizePath } from "@/lib/i18n";

const COOKIE_CONSENT_NAME = "lv_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function hasConsentCookie() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${COOKIE_CONSENT_NAME}=accepted`));
}

function setConsentCookie(value: "accepted" | "dismissed") {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function CookieConsent() {
  const pathname = usePathname();
  const activeLocale = getLocaleFromPathname(pathname);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVisible(!hasConsentCookie());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:bottom-6 sm:px-6 lg:px-8">
      <div className="lv-modal-shell mx-auto flex max-w-3xl flex-col gap-4 rounded-[24px] px-4 py-4 backdrop-blur sm:flex-row sm:items-end sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <span className="lv-neon-icon-shell lv-neon-cobalt inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-vault-electric">
            <Cookie className="size-5" />
          </span>
          <div>
            <p className="lv-text-primary text-sm font-semibold">Cookies, kept simple</p>
            <p className="lv-text-secondary mt-1 text-sm leading-6">
              Logic Vault uses small essential cookies for language choice, secure sessions, and
              basic site reliability. Accept to keep things smooth.
            </p>
            <Link
              href={localizePath("/privacy", activeLocale)}
              className="lv-link mt-2 inline-flex items-center gap-2 text-sm font-semibold transition"
            >
              <ShieldCheck className="size-4" />
              Read privacy details
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setConsentCookie("accepted");
              setVisible(false);
            }}
            className="lv-button-primary inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Accept cookies
          </button>
          <button
            type="button"
            onClick={() => {
              setConsentCookie("dismissed");
              setVisible(false);
            }}
            className="lv-header-control inline-flex size-10 items-center justify-center rounded-full border transition"
            aria-label="Dismiss cookie notice"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
