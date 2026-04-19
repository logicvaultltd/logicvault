import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="lv-page-shell px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="lv-surface mx-auto max-w-2xl rounded-[32px] px-6 py-10 text-center">
        <p className="lv-eyebrow text-sm font-semibold uppercase tracking-[0.28em]">404</p>
        <h1 className="lv-text-primary mt-4 text-3xl font-black">That page could not be found.</h1>
        <p className="lv-text-muted mt-3 text-sm leading-7">
          The page may have moved, the tool slug may be wrong, or the route is intentionally hidden.
        </p>
        <Link
          href="/"
          className="lv-button-primary mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
