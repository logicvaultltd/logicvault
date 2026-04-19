import { buildSeoMetadata } from "@/lib/seo";
import { notFound, redirect } from "next/navigation";

import { fetchPublicReport } from "@/lib/supabase-data";

export const runtime = "edge";

export const metadata = buildSeoMetadata({
  title: "Shared Report Redirect | Logic Vault",
  description: "Redirect helper for private Logic Vault shared reports.",
  path: "/r",
  noIndex: true,
});

export default async function SharedReportRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await fetchPublicReport(id);

  if (!report) {
    notFound();
  }

  redirect(`/calculators/${report.report_type}/${report.id}`);
}
