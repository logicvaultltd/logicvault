import { JsonLd } from "@/components/json-ld";
import { Dashboard } from "@/components/dashboard";
import { buildFaqSchema, buildSeoMetadata, buildWebPageSchema } from "@/lib/seo";
import { fetchActivityFeed, fetchToolPopularityCounts } from "@/lib/supabase-data";

export const metadata = buildSeoMetadata({
  title: "Logic Vault | Free Secure PDF & Financial Tools",
  description:
    "Use Logic Vault to process account statements, convert PDFs, and run financial calculators with secure, global-first workflows.",
  path: "/",
  keywords: [
    "free secure PDF tools",
    "account statement converter",
    "financial calculators",
    "global PDF tools",
    "private document processing",
  ],
});

export default async function HomePage() {
  const [activity, toolPopularity] = await Promise.all([
    fetchActivityFeed(8),
    fetchToolPopularityCounts(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            title: "Logic Vault | Free Secure PDF & Financial Tools",
            description:
              "Use Logic Vault to process account statements, convert PDFs, and run financial calculators with secure, global-first workflows.",
            path: "/",
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
