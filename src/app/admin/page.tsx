import { buildSeoMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export const metadata = buildSeoMetadata({
  title: "Not Found | Logic Vault",
  description: "This route is intentionally hidden.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  notFound();
}
