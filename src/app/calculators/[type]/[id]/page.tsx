import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PublicShareActions } from "@/components/public-share-actions";
import {
  buildPublicCalculatorTitle,
  computePublicCalculator,
  isPublicCalculatorType,
} from "@/lib/public-calculators";
import { buildBreadcrumbSchema, buildSeoMetadata, buildWebPageSchema } from "@/lib/seo";
import { fetchPublicReport } from "@/lib/supabase-data";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
  const { type, id } = await params;

  if (!isPublicCalculatorType(type)) {
    return {};
  }

  const title = `${buildPublicCalculatorTitle(type)} | Shared Logic Vault Report`;
  const description = `Review a shared ${buildPublicCalculatorTitle(type).toLowerCase()} result created with Logic Vault.`;
  const path = `/calculators/${type}/${id}`;

  return buildSeoMetadata({
    title,
    description,
    path,
    keywords: [
      buildPublicCalculatorTitle(type),
      "shared calculator report",
      "financial calculator result",
      "Logic Vault report",
    ],
    noIndex: true,
  });
}

export default async function PublicCalculatorPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  if (!isPublicCalculatorType(type)) {
    notFound();
  }

  const report = await fetchPublicReport(id);

  if (!report || report.report_type !== type) {
    notFound();
  }

  const calculation = computePublicCalculator(type, report.inputs);
  const whatsappCaption = `Check out this ${calculation.title.toLowerCase()} I ran on Logic Vault. ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://logicvault.org"}/calculators/${type}/${id}`;
  const path = `/calculators/${type}/${id}`;

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            title: calculation.title,
            description: calculation.summary,
            path,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Calculators", path: "/" },
            { name: calculation.title, path },
          ]),
        ]}
      />
      <main className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="lv-banner-shell lv-text-primary sticky top-20 z-20 mx-auto mb-6 max-w-4xl rounded-full px-5 py-3 text-center text-sm font-semibold">
          Calculated using Logic Vault - Create yours free
        </div>

        <div className="lv-surface mx-auto max-w-4xl rounded-[32px] px-6 py-8">
          <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
            Shared Report
          </p>
          <h1 className="lv-text-primary mt-3 text-3xl font-black">{calculation.title}</h1>
          <p className="mt-3 text-lg font-semibold text-vault-electric">{calculation.summary}</p>

          <div className="lv-table-shell mt-8 overflow-auto rounded-[24px]">
            <table className="lv-text-secondary min-w-full text-left text-sm">
              <tbody>
                {calculation.rows.map(([label, value]) => (
                  <tr key={label} className="border-b border-vault-border last:border-b-0">
                    <td className="lv-text-primary px-5 py-4 font-semibold">{label}</td>
                    <td className="px-5 py-4">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PublicShareActions type={type} caption={whatsappCaption} />
        </div>
      </main>
    </>
  );
}
