import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";

import { ContentShell } from "@/components/content-shell";
import type { AppLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export const metadata: Metadata = buildSeoMetadata(STATIC_PAGE_SEO.compliance);

function CompliancePageContent({
  locale = null,
}: {
  locale?: AppLocale | null;
}) {
  return (
    <ContentShell
      locale={locale}
      eyebrow="Compliance"
      icon={BadgeCheck}
      accent="blue"
      path="/compliance"
      title="Compliance"
      intro="Logic Vault is designed to align with international document handling expectations, privacy-first operating principles, and transparent disclosures."
      highlights={[
        "International document handling stance",
        "Privacy-by-design review",
        "Continuous controls and updates",
      ]}
      visualTitle="Compliance as an active operating layer"
      visualBody="We treat compliance as living product work, not a static line item hidden in the footer."
      primaryAction={{ label: "Contact the team", href: "/contact" }}
      secondaryAction={{ label: "About Logic Vault", href: "/about" }}
    >
      <section>
        <h2 className="lv-text-primary text-xl font-black">Document Handling Standards</h2>
        <p className="mt-3">
          Logic Vault follows a structured approach to document processing: narrow task scope,
          minimal retention, clear error messaging, and transparent output. These principles support
          safe workflows for financial and document-heavy use cases across multiple jurisdictions.
        </p>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">Privacy and Regional Expectations</h2>
        <p className="mt-3">
          The platform is written to support global trust signals such as GDPR-style transparency,
          CCPA-friendly disclosure language, and privacy-by-design thinking. As the product evolves,
          Logic Vault aims to keep compliance review simple, readable, and grounded in the actual
          data paths used by each tool.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="lv-surface-inset rounded-2xl p-5">
            <p className="lv-text-primary text-sm font-bold">How we think about standards</p>
            <p className="lv-text-secondary mt-3 text-sm leading-7">
              We organize compliance around document handling, disclosure, retention boundaries, and
              change management so the system can scale without drifting away from its public
              promises.
            </p>
          </div>
          <div className="lv-surface-inset rounded-2xl p-5">
            <p className="lv-text-primary text-sm font-bold">How we think about regions</p>
            <p className="lv-text-secondary mt-3 text-sm leading-7">
              The goal is not to claim every certification at once. The goal is to build a platform
              that is ready for scrutiny across multiple regions and clear enough for future audits.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">Continuous Review</h2>
        <p className="mt-3">
          Compliance is not a one-time page. Logic Vault treats it as an ongoing review of tool
          behavior, retention boundaries, and external integrations. That includes future checks for
          localization, analytics, advertising, and any cloud-based processing layers that may be
          added later.
        </p>
        <p className="mt-3">
          As more languages, routes, and integrations are added, the compliance layer should evolve
          with them. The page stays strongest when it reflects the system as it really works.
        </p>
      </section>
    </ContentShell>
  );
}

export default function CompliancePage() {
  return <CompliancePageContent />;
}
