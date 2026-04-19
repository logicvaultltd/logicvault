import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Dashboard } from "@/components/dashboard";
import { JsonLd } from "@/components/json-ld";
import { isSupportedLocale } from "@/lib/i18n";
import { buildFaqSchema, buildSeoMetadata, buildWebPageSchema } from "@/lib/seo";
import { fetchActivityFeed, fetchToolPopularityCounts } from "@/lib/supabase-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  return buildSeoMetadata({
    title: "Logic Vault | Every Financial & PDF Tool, 100% Free & Secure",
    description:
      "Process Account Statements, Merge PDFs, and convert financial data locally. No data leaves your computer. Built for the Global Citizen.",
    path: "/",
    locale,
    keywords: [
      "free secure PDF tools",
      "account statement converter",
      "financial calculators",
      "global PDF tools",
      "private document processing",
    ],
  });
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const [activity, toolPopularity] = await Promise.all([
    fetchActivityFeed(8),
    fetchToolPopularityCounts(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            title: "Logic Vault | Every Financial & PDF Tool, 100% Free & Secure",
            description:
              "Process Account Statements, Merge PDFs, and convert financial data locally. No data leaves your computer. Built for the Global Citizen.",
            path: "/",
            locale,
          }),
          buildFaqSchema([
            {
              question: "What can I do with Logic Vault?",
              answer:
                "Logic Vault helps you convert PDFs, clean up account statements, and run finance calculators from one focused utility workspace.",
            },
            {
              question: "Is Logic Vault safe for financial documents?",
              answer:
                "Logic Vault is designed around privacy-first handling, clear processing states, and secure output flows for sensitive business work.",
            },
            {
              question: "Does Logic Vault offer free tools?",
              answer:
                "Yes. Logic Vault offers free utilities for document conversion, account statement exports, and common finance workflows.",
            },
          ]),
        ]}
      />
      <Dashboard initialActivities={activity} initialToolPopularity={toolPopularity} />
    </>
  );
}
