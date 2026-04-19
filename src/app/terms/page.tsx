import type { Metadata } from "next";
import { Scale } from "lucide-react";

import { ContentShell } from "@/components/content-shell";
import type { AppLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export const metadata: Metadata = buildSeoMetadata(STATIC_PAGE_SEO.terms);

function TermsPageContent({
  locale = null,
}: {
  locale?: AppLocale | null;
}) {
  return (
    <ContentShell
      locale={locale}
      eyebrow="Terms"
      icon={Scale}
      accent="amber"
      path="/terms"
      title="Terms of Service"
      intro="These terms explain how Logic Vault is offered, what users can expect, and where responsibility begins and ends."
      highlights={[
        "As-is utility service",
        "Output should always be reviewed",
        "No financial advice is created",
      ]}
      visualTitle="Clear boundaries, readable terms"
      visualBody="We keep the language direct so operators know how to use the tools responsibly and where legal limits apply."
      primaryAction={{ label: "Contact us", href: "/contact" }}
      secondaryAction={{ label: "Read compliance", href: "/compliance" }}
    >
      <section>
        <h2 className="lv-text-primary text-xl font-black">As-Is Service</h2>
        <p className="mt-3">
          Logic Vault is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. We work to make the
          platform reliable, but we do not guarantee uninterrupted availability, perfect output, or
          fitness for every business, legal, accounting, or archival use case.
        </p>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">User Responsibility</h2>
        <p className="mt-3">
          Users are responsible for reviewing any generated output before relying on it. This
          includes financial calculations, converted documents, extracted statement data, summaries,
          and translated content. Logic Vault should support decisions, not replace professional
          judgement.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Check converted files before sending them to a client, lender, or tax professional.",
            "Review calculations before making financial or property decisions.",
            "Use specialist advice when a legal, tax, or regulated outcome depends on the result.",
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
        <h2 className="lv-text-primary text-xl font-black">Liability Protection</h2>
        <p className="mt-3">
          To the maximum extent permitted by law, Logic Vault is not liable for losses tied to
          business strategy, tax planning, investment choices, property decisions, marketing spend,
          or any other financial action taken using the platform. Use of the tools does not create
          legal, tax, accounting, or fiduciary advice.
        </p>
        <p className="mt-3">
          These terms are designed to keep expectations clear. We want the platform to feel
          dependable, but we also want users to understand where software ends and professional
          judgement begins.
        </p>
      </section>
    </ContentShell>
  );
}

export default function TermsPage() {
  return <TermsPageContent />;
}
