import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CompliancePage from "@/app/compliance/page";
import { isSupportedLocale } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { STATIC_PAGE_SEO } from "@/lib/static-page-seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  return buildSeoMetadata({ ...STATIC_PAGE_SEO.compliance, locale });
}

export default async function LocalizedCompliancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <CompliancePage />;
}
