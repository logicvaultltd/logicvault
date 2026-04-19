import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";

import { ContentShell } from "@/components/content-shell";
import type { AppLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export const metadata: Metadata = buildSeoMetadata(STATIC_PAGE_SEO.security);

function SecurityPageContent({
  locale = null,
}: {
  locale?: AppLocale | null;
}) {
  return (
    <ContentShell
      locale={locale}
      eyebrow="Security"
      icon={LockKeyhole}
      accent="slate"
      path="/security"
      title="Security"
      intro="Logic Vault is built around practical trust: minimal retention, transparent processing, and defensive handling of sensitive documents."
      highlights={[
        "Local-first workflows",
        "256-bit class encryption standards",
        "Short-lived processing windows",
      ]}
      visualTitle="Security without mystery"
      visualBody="Each workflow is designed to reduce exposure, make processing states obvious, and keep sensitive documents moving fast."
      primaryAction={{ label: "Talk to operations", href: "/contact" }}
      secondaryAction={{ label: "Review privacy", href: "/privacy" }}
    >
      <section>
        <h2 className="lv-text-primary text-xl font-black">Local-First Processing</h2>
        <p className="mt-3">
          Logic Vault is designed for local-first style workflows where files are processed quickly
          and not retained as a service feature. This matters most for account statements, financial
          reports, and other sensitive documents where privacy expectations are high.
        </p>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">AES-256 Encrypted Vault Packages</h2>
        <p className="mt-3">
          When users choose the Logic Vault protect flow, locked files are wrapped using AES-256
          encryption and an authenticated decryption step. That gives the protected package a strong
          local security layer before it is downloaded and stored by the user.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Encrypted transport whenever cloud-assisted workflows are active.",
            "Clear maintenance states when a provider is unavailable or intentionally disabled.",
            "Download-focused output handling to reduce long-lived processing exposure.",
          ].map((item) => (
            <div
              key={item}
              className="lv-surface-inset lv-text-secondary rounded-2xl p-4 text-sm leading-7"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">Operational Controls</h2>
        <p className="mt-3">
          We favor short-lived processing, tight route boundaries, and explicit crawler controls on
          processing endpoints. Internal or future administrative routes are intended to remain
          non-indexed. Logic Vault also avoids unnecessary public references to any specific region
          so the platform reads as a global software product rather than a local project landing
          page.
        </p>
        <p className="mt-3">
          When cloud-assisted workflows are enabled, Logic Vault is structured to use encrypted
          transport, short-lived job execution, and auto-cleanup windows instead of open-ended
          retention. The design target is practical enterprise hygiene: minimal exposure, 256-bit
          class encryption standards in transit and at rest on partner platforms, and clear
          deletion expectations after a task is complete.
        </p>
        <div className="lv-surface-inset mt-5 rounded-2xl p-5">
          <p className="lv-text-primary text-sm font-bold">How the team treats security work</p>
          <p className="lv-text-secondary mt-3 text-sm leading-7">
            Security is treated as a product surface, not just infrastructure. That means
            improving copy, states, fallbacks, and route behavior wherever users need more clarity
            about what happens to a file.
          </p>
        </div>
      </section>
    </ContentShell>
  );
}

export default function SecurityPage() {
  return <SecurityPageContent />;
}
