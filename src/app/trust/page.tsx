import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { ContentShell } from "@/components/content-shell";
import type { AppLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export const metadata: Metadata = buildSeoMetadata(STATIC_PAGE_SEO.trust);

function TrustPageContent({
  locale = null,
}: {
  locale?: AppLocale | null;
}) {
  return (
    <ContentShell
      locale={locale}
      eyebrow="Trust"
      icon={ShieldCheck}
      accent="green"
      path="/trust"
      title="Trust built into every workflow"
      intro="Logic Vault is designed so people can understand what the tool is doing, what data is involved, and how safely each task is handled before they press the main button."
      highlights={[
        "Readable processing flow",
        "No hidden storage promises",
        "Clear boundaries around every task",
      ]}
      visualTitle="Trust should feel visible"
      visualBody="We favor direct copy, local-first defaults, and task-by-task disclosures so users know what happens before and after each conversion."
      primaryAction={{ label: "Read security", href: "/security" }}
      secondaryAction={{ label: "Review privacy", href: "/privacy" }}
    >
      <section>
        <h2 className="lv-text-primary text-xl font-black">What trust means here</h2>
        <p className="mt-3">
          For Logic Vault, trust is not a slogan layered onto the footer. It is a product rule. We
          try to make file handling, tool logic, cloud dependencies, and output steps obvious enough
          that a serious user can make a confident decision before uploading anything sensitive.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Simple flows that explain each step before processing starts.",
            "Direct notices when a cloud provider is active or unavailable.",
            "Download-ready outputs with fewer hidden decisions and fewer surprises.",
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
        <h2 className="lv-text-primary text-xl font-black">The operating promises</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="lv-surface-inset rounded-2xl p-5">
            <p className="lv-text-primary text-sm font-bold">Plain language over vague claims</p>
            <p className="lv-text-secondary mt-3 text-sm leading-7">
              We prefer short, readable notices over polished but unclear copy. If a route depends
              on a provider, users should see that. If a task is local-first, that should also be
              obvious.
            </p>
          </div>
          <div className="lv-surface-inset rounded-2xl p-5">
            <p className="lv-text-primary text-sm font-bold">Respect for sensitive documents</p>
            <p className="lv-text-secondary mt-3 text-sm leading-7">
              Account statements, tax documents, and business reports deserve stricter handling
              expectations. That is why the product leans into minimal retention, clear states, and
              defensive defaults.
            </p>
          </div>
        </div>
      </section>
    </ContentShell>
  );
}

export default function TrustPage() {
  return <TrustPageContent />;
}
