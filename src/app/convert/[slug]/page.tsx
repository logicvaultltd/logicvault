import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConvertSeoCopy } from "@/components/convert-seo-copy";
import { DynamicConvertWorkstation } from "@/components/dynamic-convert-workstation";
import { JsonLd } from "@/components/json-ld";
import { allPages, findSeoPageBySlug, getRelatedFormatSlug } from "@/lib/seo-matrix";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSeoMetadata,
  buildSoftwareApplicationSchema,
} from "@/lib/seo";

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return allPages.slice(0, 100).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findSeoPageBySlug(slug);

  if (!page) {
    return {
      title: "Convert Statement PDF | Logic Vault",
    };
  }

  const title = `Convert ${page.bankName} PDF to ${page.targetLabel} | Free Online Tool`;
  const description = `Use Logic Vault to convert ${page.bankName} account statement PDFs into ${page.targetLabel}. Fast, private, and branded for clean downloads.`;
  const path = `/convert/${page.slug}`;

  return buildSeoMetadata({
    title,
    description,
    path,
    keywords: [
      `${page.bankName} PDF to ${page.targetLabel}`,
      `${page.bankName} statement converter`,
      `${page.bankName} account statement`,
      `PDF to ${page.targetLabel}`,
      "account statement to CSV",
      "secure statement converter",
    ],
  });
}

export default async function ConvertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = findSeoPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const relatedSlug = getRelatedFormatSlug(page);
  const relatedPage = findSeoPageBySlug(relatedSlug);
  const path = `/convert/${page.slug}`;
  const title = `Convert ${page.bankName} PDF to ${page.targetLabel} | Free Online Tool`;
  const description = `Use Logic Vault to convert ${page.bankName} account statement PDFs into ${page.targetLabel}. Fast, private, and branded for clean downloads.`;
  const keywords = [
    `${page.bankName} PDF to ${page.targetLabel}`,
    `${page.bankName} statement converter`,
    `${page.bankName} account statement`,
    `PDF to ${page.targetLabel}`,
    "account statement to CSV",
    "secure statement converter",
  ];
  const faqSchema = buildFaqSchema([
    {
      question: `How do I convert ${page.bankName} PDF to ${page.targetLabel}?`,
      answer:
        `Upload your ${page.bankName} account statement PDF, start the conversion, and Logic Vault prepares a ${page.targetLabel} download card when processing finishes.`,
    },
    {
      question: `Is ${page.bankName} PDF conversion secure?`,
      answer:
        "Logic Vault is designed around privacy-first processing, clear status updates, and branded downloads that make resulting files easier to recognize and manage.",
    },
  ]);

  return (
    <>
      <JsonLd
        data={[
          buildSoftwareApplicationSchema({
            name: title,
            description,
            path,
            keywords,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Convert", path: "/" },
            { name: `Convert ${page.bankName} PDF to ${page.targetLabel}`, path },
          ]),
          faqSchema,
        ]}
      />
      <main className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <DynamicConvertWorkstation
            bankName={page.bankName}
            slug={page.slug}
            targetLabel={page.targetLabel}
            targetFormat={page.targetFormat}
            relatedHref={`/convert/${relatedSlug}`}
            relatedLabel={relatedPage?.targetLabel ?? "CSV"}
          />
          <ConvertSeoCopy bankName={page.bankName} targetLabel={page.targetLabel} />
        </div>
      </main>
    </>
  );
}
