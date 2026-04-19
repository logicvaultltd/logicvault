"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(
  () => import("@/components/cookie-consent").then((module) => module.CookieConsent),
  { ssr: false }
);
const LanguageSuggestion = dynamic(
  () => import("@/components/language-suggestion").then((module) => module.LanguageSuggestion),
  { ssr: false }
);
const ServiceWorkerRecovery = dynamic(
  () => import("@/components/service-worker-recovery").then((module) => module.ServiceWorkerRecovery),
  { ssr: false }
);

export function DeferredShellOverlays() {
  return (
    <>
      <ServiceWorkerRecovery />
      <LanguageSuggestion />
      <CookieConsent />
    </>
  );
}
