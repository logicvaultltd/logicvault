import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SecurityPage from "@/app/security/page";
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

  return buildSeoMetadata({ ...STATIC_PAGE_SEO.security, locale });
}

export default async function LocalizedSecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <SecurityPage />;
}
