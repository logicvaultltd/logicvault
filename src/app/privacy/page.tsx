import type { Metadata } from "next";
import { Shield } from "lucide-react";

import { ContentShell } from "@/components/content-shell";
import type { AppLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export const metadata: Metadata = buildSeoMetadata(STATIC_PAGE_SEO.privacy);

function PrivacyPageContent({
  locale = null,
}: {
  locale?: AppLocale | null;
}) {
  return (
    <ContentShell
      locale={locale}
      eyebrow="Privacy"
      icon={Shield}
      accent="green"
      path="/privacy"
      title="Privacy Policy"
      intro="Logic Vault follows a zero-data-retention mindset. We aim to process files with minimal exposure, clear boundaries, and practical privacy controls."
      highlights={[
        "Zero-data-retention mindset",
        "Minimal collection",
        "Built for sensitive financial files",
      ]}
      visualTitle="Privacy that reads clearly"
      visualBody="The product is structured to keep document handling narrow, explain what happens, and avoid hidden data reuse."
      primaryAction={{ label: "Contact privacy team", href: "/contact" }}
      secondaryAction={{ label: "Read security", href: "/security" }}
    >
      <section>
        <h2 className="lv-text-primary text-xl font-black">Zero-Data-Retention Policy</h2>
        <p className="mt-3">
          Logic Vault is designed so that account statements, PDF files, and similar documents are
          not stored as a product feature. We do not build user profiles from document contents, and
          we do not keep uploaded files for later resale, data mining, or hidden analytics. Where a
          workflow requires active processing, the goal is fast completion and prompt disposal.
        </p>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">GDPR and CCPA</h2>
        <p className="mt-3">
          Logic Vault is operated with privacy expectations consistent with GDPR and CCPA principles.
          We limit collection to the minimum needed for site operation, fraud prevention, and product
          security. We do not sell personal data. If future account systems are introduced, users
          will be given clear controls for access, correction, deletion, and data export where
          applicable.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="lv-note-success rounded-2xl p-5">
            <p className="text-sm font-bold text-vault-lime">What we try to collect only when needed</p>
            <ul className="lv-text-primary mt-3 space-y-3 text-sm leading-7">
              <li>Basic technical logs required for uptime, abuse prevention, and service health.</li>
              <li>Anonymous analytics signals that help us understand which tools are being used.</li>
              <li>Temporary processing details when a workflow must complete an active task.</li>
            </ul>
          </div>
          <div className="lv-surface-inset rounded-2xl p-5">
            <p className="lv-text-primary text-sm font-bold">What we do not want to become</p>
            <ul className="lv-text-secondary mt-3 space-y-3 text-sm leading-7">
              <li>A data brokerage business built on private documents.</li>
              <li>A hidden profiling layer built from statement contents.</li>
              <li>An open-ended storage vault for sensitive uploaded files.</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">Anonymous Usage Signals</h2>
        <p className="mt-3">
          Basic technical logs, security checks, and coarse analytics may be used to keep the
          service stable, measure uptime, and understand which tools are useful. These signals are
          intended to stay as anonymous and aggregate as possible. Logic Vault is built to avoid
          collecting more than it truly needs.
        </p>
        <p className="mt-3">
          When users ask privacy questions, the goal is to answer them in direct language rather
          than legal fog. If a workflow changes later, the privacy documentation should change with
          it so the page stays tied to real system behavior.
        </p>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">Cookies and Local Storage</h2>
        <p className="mt-3">
          Logic Vault uses a small number of browser cookies and local storage entries to keep the
          site functional and calm to use. These items may remember language preference, privacy
          acknowledgements, secure admin session state, and lightweight interface choices so the
          product does not force the same prompt on every visit.
        </p>
        <p className="mt-3">
          We do not treat cookies as a hidden surveillance layer. Their purpose is operational:
          helping the site load in the right language, protecting authenticated areas, and making
          the experience more stable for repeat visits. If our cookie usage changes in a meaningful
          way, this page should be updated to explain that plainly.
        </p>
      </section>
    </ContentShell>
  );
}

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
