import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { ContentShell } from "@/components/content-shell";
import type { AppLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export const metadata: Metadata = buildSeoMetadata(STATIC_PAGE_SEO.contact);

function ContactPageContent({
  locale = null,
}: {
  locale?: AppLocale | null;
}) {
  return (
    <ContentShell
      locale={locale}
      eyebrow="Contact"
      icon={BriefcaseBusiness}
      accent="red"
      path="/contact"
      title="Work with the Logic Vault team"
      intro="If you want to partner with us, advertise with us, or ask a practical question about the platform, this is the fastest way to reach operations."
      highlights={[
        "General inquiries and support",
        "Partnership and integration requests",
        "Ad placement and sponsorship opportunities",
      ]}
      visualTitle="One place for partnerships, support, and sponsorships"
      visualBody="Use the form below and the message will go straight to the Logic Vault operations inbox with the context needed to respond quickly."
      secondaryAction={{ label: "Browse tools", href: "/#tools" }}
    >
      <ContactForm />
      <section>
        <h2 className="lv-text-primary text-xl font-black">What helps us reply faster</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "For partnerships: tell us the product, the integration idea, and the markets you care about.",
            "For ad placement: include timing, target regions, creative format, and campaign goals.",
            "For support: include the tool name, file type, and the exact step where the issue appears.",
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
    </ContentShell>
  );
}

export default function ContactPage() {
  return <ContactPageContent />;
}
