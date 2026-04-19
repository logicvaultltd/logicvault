"use client";

import Link from "next/link";

interface PublicShareActionsProps {
  type: string;
  caption: string;
}

export function PublicShareActions({ type, caption }: PublicShareActionsProps) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={async () => {
          try {
            await fetch("/api/activity", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                event: "whatsapp-share",
                toolSlug: type,
              }),
            });
          } catch {
            // Keep share flow resilient.
          }

          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }}
        className="inline-flex items-center justify-center rounded-full bg-vault-lime px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Share to WhatsApp
      </button>
      <Link
        href="/"
        className="lv-button-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
      >
        Create your own free
      </Link>
    </div>
  );
}
