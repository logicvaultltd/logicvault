import { cookies } from "next/headers";

import { LexDashboard } from "@/components/lex-dashboard";
import { getAnalyticsSnapshot } from "@/lib/analytics";
import {
  getConfiguredAdminEmail,
  getAdminCookieName,
  verifyAdminToken,
} from "@/lib/admin-auth";
import { getSiteConfig } from "@/lib/config-provider";
import { buildSeoMetadata } from "@/lib/seo";

export const runtime = "edge";

export const metadata = buildSeoMetadata({
  title: "Lex Auth | Logic Vault",
  description: "Protected Logic Vault command center.",
  path: "/lex/auth",
  noIndex: true,
});

export default async function LexAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, cookieStore, config, analytics] = await Promise.all([
    searchParams,
    cookies(),
    getSiteConfig(),
    getAnalyticsSnapshot(),
  ]);
  const adminEmail = getConfiguredAdminEmail();
  const isAuthenticated = await verifyAdminToken(
    cookieStore.get(getAdminCookieName())?.value
  );

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-24">
        <div className="mx-auto max-w-md rounded-[32px] border border-slate-800 bg-slate-900 p-8 text-white shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Logic Vault
          </p>
          <h1 className="mt-3 text-3xl font-black">Lex Auth</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Secure command center for site configuration, ad controls, SEO, and analytics.
          </p>
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
            Admin account: <span className="font-semibold text-white">{adminEmail}</span>
          </div>

          <form action="/api/lex/login" method="post" className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Admin Email</span>
              <input
                name="email"
                type="email"
                defaultValue={adminEmail}
                required
                className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-vault-blue"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Admin Password</span>
              <input
                name="password"
                type="password"
                required
                className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-vault-blue"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-[rgba(0,229,255,0.18)] bg-[rgba(0,229,255,0.08)] px-4 py-3 text-sm text-cyan-100">
                Admin email or password check failed. Please try again.
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-vault-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b557f]"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040912] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <LexDashboard config={config} analytics={analytics} />
      </div>
    </main>
  );
}
