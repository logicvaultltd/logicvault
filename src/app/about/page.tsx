import type { Metadata } from "next";
import { Globe2 } from "lucide-react";

import { ContentShell } from "@/components/content-shell";
import type { AppLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export const metadata: Metadata = buildSeoMetadata(STATIC_PAGE_SEO.about);

function AboutPageContent({
  locale = null,
}: {
  locale?: AppLocale | null;
}) {
  return (
    <ContentShell
      locale={locale}
      eyebrow="About Logic Vault"
      icon={Globe2}
      accent="blue"
      path="/about"
      title="Global Financial Infrastructure for the Digital Citizen"
      intro="Logic Vault exists to help people move faster with secure financial utilities, clean document tools, and practical workflows that do not demand a technical background."
      highlights={[
        "Global-first workflows",
        "Clear local-first privacy posture",
        "Built for operators and modern teams",
      ]}
      visualTitle="A lighter way to handle serious file work"
      visualBody="We design each workflow to feel focused, quick to understand, and safe enough for sensitive business documents."
      primaryAction={{ label: "Contact the team", href: "/contact" }}
      secondaryAction={{ label: "Browse tools", href: "/#tools" }}
    >
      <section>
        <h2 className="lv-text-primary text-xl font-black">Mission</h2>
        <p className="mt-3">
          Logic Vault is built around one simple idea: important file work should feel clear,
          safe, and global from day one. We serve founders, accountants, operators, students,
          remote workers, and everyday users who need trustworthy tools for account statements,
          reports, conversions, and financial decision support.
        </p>
        <p className="mt-3">
          Our design language stays lightweight on purpose. Instead of dashboards packed with
          noise, we focus on sharp utility pages that make one task feel easy. That means fewer
          clicks, clearer progress states, and outputs that are ready for the next step in a real
          workflow.
        </p>
      </section>

      <section>
        <h2 className="lv-text-primary text-xl font-black">Global Reach</h2>
        <p className="mt-3">
          Logic Vault is shaped for international use. The platform is structured for global SEO,
          multilingual discovery, and document workflows that make sense across borders. Whether a
          user is reviewing property yield in London, cleaning statements in New York, or preparing
          reports from Lagos to Lisbon, the product aims to feel fast, readable, and dependable.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Founders who need a faster way to tidy statements, reports, and operating documents.",
            "Finance and operations teams that want cleaner conversions with less back-and-forth.",
            "Independent professionals who want simple tools that still feel trustworthy and premium.",
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
        <h2 className="lv-text-primary text-xl font-black">Trust Principles</h2>
        <p className="mt-3">
          We favor zero-clutter interfaces, direct copy, and secure handling principles. Logic
          Vault is designed around local-first processing patterns, clear disclosures, and a strong
          bias toward user understanding. That trust layer matters just as much as the code itself.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="lv-surface-inset rounded-2xl p-5">
            <p className="lv-text-primary text-sm font-bold">What makes the product different</p>
            <ul className="lv-text-secondary mt-3 space-y-3 text-sm leading-7">
              <li>Focused task pages instead of cluttered dashboards.</li>
              <li>Privacy-first defaults paired with direct, readable copy.</li>
              <li>Clean outputs that are easy to hand off to the next workflow.</li>
            </ul>
          </div>
          <div className="lv-surface-inset rounded-2xl p-5">
            <p className="lv-text-primary text-sm font-bold">Who we are building for</p>
            <ul className="lv-text-secondary mt-3 space-y-3 text-sm leading-7">
              <li>Teams moving across markets and currencies.</li>
              <li>Operators handling sensitive documents under time pressure.</li>
              <li>People who care about trust as much as speed.</li>
            </ul>
          </div>
        </div>
      </section>
    </ContentShell>
  );
}

export default function AboutPage() {
  return <AboutPageContent />;
}
