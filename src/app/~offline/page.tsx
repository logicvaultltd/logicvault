import Link from "next/link";
import { WifiOff } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

export default function OfflinePage() {
  return (
    <main className="lv-page-shell flex min-h-screen items-center justify-center px-4 py-24">
      <section className="lv-surface mx-auto max-w-2xl rounded-[36px] p-6 text-center sm:p-10">
        <BrandLogo className="justify-center" size={48} textClassName="lv-text-primary" />
        <div className="lv-neon-icon-shell lv-neon-cobalt mx-auto mt-8 flex size-16 items-center justify-center rounded-3xl text-vault-electric">
          <WifiOff className="size-8" />
        </div>
        <p className="lv-eyebrow mt-6 text-xs font-semibold uppercase tracking-[0.28em]">
          Offline Vault Mode
        </p>
        <h1 className="lv-text-primary mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
          Logic Vault is ready when your connection returns.
        </h1>
        <p className="lv-text-secondary mx-auto mt-4 max-w-xl text-sm leading-8">
          The app shell and recently visited tools are cached for a faster experience. Some
          conversion, AI, and contact actions still need a live connection to finish securely.
        </p>
        <Link
          href="/"
          className="lv-button-primary mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition"
        >
          Return to Vault
        </Link>
      </section>
    </main>
  );
}
