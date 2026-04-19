import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { ToolSeoCopy } from "@/components/tool-seo-copy";
import { DynamicWorkstation } from "@/components/dynamic-workstation";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSeoMetadata,
  buildSoftwareApplicationSchema,
} from "@/lib/seo";
import { findToolBySlug, TOOLS } from "@/lib/tools-registry";
import { buildToolUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}

function buildToolMeta(tool: (typeof TOOLS)[number]) {
  return {
    title: `${tool.title} | Fast, Secure & Free | Logic Vault`,
    description: `Professional-grade ${tool.title}. Securely process data locally or via AI. No subscription required.`,
    keywords: [
      "Fintech tools",
      tool.title,
      "developer utility",
      "secure PDF",
      "JSON converter",
      tool.category,
      ...(tool.keywords ?? []),
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = findToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found | Logic Vault - Free & Secure",
    };
  }

  const pathname = buildToolUrl(tool.id);
  const { title, description, keywords } = buildToolMeta(tool);

  return buildSeoMetadata({
    title,
    description,
    path: pathname,
    keywords,
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = findToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const pathname = buildToolUrl(tool.id);
  const { description, keywords } = buildToolMeta(tool);
  const faqSchema = buildFaqSchema([
    {
      question: `How do I use ${tool.title}?`,
      answer:
        tool.mode === "file"
          ? `Open the ${tool.title} page, upload the file requested by the tool, review any small settings, and start processing. Logic Vault shows clear progress states and prepares a downloadable result when the task finishes.`
          : `Open the ${tool.title} page, enter the required values, review the short form, and start the calculation. Logic Vault returns a result designed for quick finance or document workflows.`,
    },
    {
      question: `Is ${tool.title} safe for sensitive files?`,
      answer:
        "Logic Vault is designed around local-first handling, clear status messages, and short-lived processing boundaries so users can understand how a task is handled before they start.",
    },
  ]);

  return (
    <>
      <JsonLd
        data={[
          buildSoftwareApplicationSchema({
            name: tool.title,
            description,
            path: pathname,
            keywords,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/" },
            { name: tool.title, path: pathname },
          ]),
          faqSchema,
        ]}
      />
      <DynamicWorkstation tool={tool} />
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <ToolSeoCopy tool={tool} />
      </div>
    </>
  );
}
