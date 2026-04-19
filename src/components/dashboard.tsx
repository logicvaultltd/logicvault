"use client";

import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { BrandLogo } from "@/components/brand-logo";
import { ExitIntentModal } from "@/components/exit-intent-modal";
import { SocialTicker } from "@/components/social-ticker";
import { ToolCard } from "@/components/tool-card";
import { getDictionary, getLocaleFromPathname, localizePath } from "@/lib/i18n";
import { TOOLS, type ToolDefinition } from "@/lib/tools-registry";

type ToolPopularityMap = Record<string, number>;

function injectSponsoredCards<T>(items: T[], interval = 8) {
  const output: Array<T | { sponsored: true; id: string }> = [];

  items.forEach((item, index) => {
    output.push(item);

    if ((index + 1) % interval === 0 && index + 1 < items.length) {
      output.push({ sponsored: true, id: `sponsored-${index}` });
    }
  });

  return output;
}

const DISCOVERY_TOOL_IDS = [
  "json-universal-converter",
  "json-formatter-validator",
  "json-to-typescript-interface",
  "json-minifier",
  "compare-pdf",
  "redact-pdf",
  "crop-pdf",
  "scan-to-pdf",
];

const DEFAULT_POPULAR_TOOL_IDS = [
  "statement-to-csv",
  "json-universal-converter",
  "merge-pdf",
  "ai-summarizer",
];

function sortToolsByPopularity(tools: ToolDefinition[], popularity: ToolPopularityMap) {
  const defaultRank = new Map(DEFAULT_POPULAR_TOOL_IDS.map((id, index) => [id, index]));
  const originalRank = new Map(TOOLS.map((tool, index) => [tool.id, index]));
  const hasUsageData = Object.values(popularity).some((count) => count > 0);

  return [...tools].sort((first, second) => {
    const firstUsage = popularity[first.id] ?? 0;
    const secondUsage = popularity[second.id] ?? 0;

    if (hasUsageData && firstUsage !== secondUsage) {
      return secondUsage - firstUsage;
    }

    const firstDefaultRank = defaultRank.get(first.id) ?? Number.MAX_SAFE_INTEGER;
    const secondDefaultRank = defaultRank.get(second.id) ?? Number.MAX_SAFE_INTEGER;

    if (firstDefaultRank !== secondDefaultRank) {
      return firstDefaultRank - secondDefaultRank;
    }

    if (first.featured !== second.featured) {
      return first.featured ? -1 : 1;
    }

    return (originalRank.get(first.id) ?? 0) - (originalRank.get(second.id) ?? 0);
  });
}

export function Dashboard({
  initialActivities = [],
  initialToolPopularity = {},
}: {
  initialActivities?: Array<{
    id: number | string;
    city: string | null;
    file_type: string | null;
    tool_slug: string | null;
  }>;
  initialToolPopularity?: ToolPopularityMap;
}) {
  const pathname = usePathname();
  const activeLocale = getLocaleFromPathname(pathname);
  const copy = getDictionary(activeLocale);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const isSearchVisible = searchOpen || query.trim().length > 0;
  const sortedTools = useMemo(
    () => sortToolsByPopularity(TOOLS, initialToolPopularity),
    [initialToolPopularity]
  );
  const filteredTools = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return sortedTools;
    }

    return sortedTools.filter((tool) => {
      const haystack = [
        tool.title,
        tool.description,
        tool.category,
        ...(tool.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, sortedTools]);
  const popularTools = useMemo(
    () => filteredTools.slice(0, 8),
    [filteredTools]
  );
  const popularToolIds = useMemo(
    () => new Set(popularTools.map((tool) => tool.id)),
    [popularTools]
  );
  const discoveryTools = useMemo(
    () =>
      DISCOVERY_TOOL_IDS.map((id) => filteredTools.find((tool) => tool.id === id))
        .filter((tool): tool is ToolDefinition => Boolean(tool))
        .filter((tool) => !popularToolIds.has(tool.id)),
    [filteredTools, popularToolIds]
  );
  const visibleToolIds = useMemo(
    () => new Set([...popularTools, ...discoveryTools].map((tool) => tool.id)),
    [discoveryTools, popularTools]
  );
  const secondaryTools = useMemo(
    () => filteredTools.filter((tool) => !visibleToolIds.has(tool.id)),
    [filteredTools, visibleToolIds]
  );
  const secondaryItems = useMemo(
    () => injectSponsoredCards(secondaryTools),
    [secondaryTools]
  );
  const featuredToolCount = useMemo(
    () => TOOLS.length,
    []
  );

  return (
    <main className="lv-page-shell pt-24">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="lv-hero-shell overflow-hidden rounded-[36px]">
          <div className="grid gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(290px,0.85fr)] lg:px-10">
            <div>
              <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.3em]">
                {copy.heroEyebrow}
              </p>
              <h1 className="lv-text-primary mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                {copy.heroTitle}
              </h1>
              <p className="lv-text-secondary mt-4 max-w-2xl text-base leading-8">
                {copy.heroBody}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#tools"
                  className="lv-button-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition"
                >
                  {copy.heroPrimaryCta}
                </Link>
                <button
                  id="tool-search"
                  type="button"
                  onClick={() => setSearchOpen((current) => !current)}
                  className="lv-button-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition"
                >
                  <Search className="size-4" />
                  {copy.heroSecondaryCta}
                </button>
              </div>

              {isSearchVisible ? (
                <div className="lv-search-shell mt-5 max-w-2xl rounded-[24px] p-4 backdrop-blur-xl">
                  <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                    {copy.heroSearchLabel}
                  </p>
                  <label className="lv-input-base mt-3 flex items-center gap-3 rounded-2xl px-4 py-3">
                    <Search className="size-5 lv-text-muted" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={copy.searchPlaceholder}
                      className="w-full bg-transparent text-sm lv-text-primary outline-none"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="lv-surface-soft rounded-[26px] p-5 backdrop-blur-xl sm:col-span-3 lg:col-span-1">
                <div className="flex items-center gap-4">
                  <BrandLogo size={64} showWordmark={false} priority markClassName="rounded-[22px]" />
                  <div>
                    <p className="lv-text-primary text-sm font-bold">Secure utility vault</p>
                    <p className="lv-text-muted text-sm">
                      Financial documents, developer data, and PDF workflows in one clean space
                    </p>
                  </div>
                </div>
              </div>

              <div className="lv-surface-soft rounded-[26px] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="lv-neon-icon-shell lv-neon-cobalt flex size-11 items-center justify-center rounded-2xl text-vault-cyan">
                    <Workflow className="size-5" />
                  </span>
                  <div>
                    <p className="lv-text-primary text-sm font-bold">{copy.heroFeaturedLabel}</p>
                    <p className="lv-text-muted text-sm">
                      {featuredToolCount} secure tools ready now
                    </p>
                  </div>
                </div>
              </div>

              <div className="lv-surface-soft rounded-[26px] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="lv-neon-icon-shell lv-neon-lime flex size-11 items-center justify-center rounded-2xl text-vault-lime">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="lv-text-primary text-sm font-bold">Private by default</p>
                    <p className="lv-text-muted text-sm">
                      Clear processing states and safer handling for finance work
                    </p>
                  </div>
                </div>
              </div>

              <div className="lv-surface-soft rounded-[26px] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="lv-neon-icon-shell lv-neon-cyan flex size-11 items-center justify-center rounded-2xl text-[#9eb8ff]">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <p className="lv-text-primary text-sm font-bold">Built for repeat use</p>
                    <p className="lv-text-muted text-sm">
                      Fast conversions, calculators, and exports without extra clutter
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <AdSlot slot="leaderboard" />
        </div>

        <div className="mt-6">
          <SocialTicker initialItems={initialActivities} />
        </div>

        <div id="tools" className="mt-8 space-y-10">
          {filteredTools.length > 0 ? (
            <>
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                      Popular now
                    </p>
                    <p className="lv-text-muted mt-1 text-sm">
                      Sorted by recent secure usage, with trusted launch tools first.
                    </p>
                  </div>
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSearchOpen(false);
                      }}
                      className="lv-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition"
                    >
                      Clear search
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {popularTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      href={localizePath(`/tool/${tool.id}`, activeLocale)}
                    />
                  ))}
                </div>
              </section>

              {discoveryTools.length > 0 ? (
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                        Newly upgraded
                      </p>
                      <p className="lv-text-muted mt-1 text-sm">
                        Fresh JSON and PDF tools for secure technical workflows.
                      </p>
                    </div>
                    <Link
                      href="#tools"
                      className="lv-link hidden items-center gap-2 text-sm font-semibold transition sm:inline-flex"
                    >
                      Keep browsing
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {discoveryTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        href={localizePath(`/tool/${tool.id}`, activeLocale)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {secondaryItems.length > 0 ? (
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                        All tools
                      </p>
                      <p className="lv-text-muted mt-1 text-sm">
                        Browse the wider Logic Vault library for document and finance work.
                      </p>
                    </div>
                    <Link
                      href="#tools"
                      className="lv-link inline-flex items-center gap-2 text-sm font-semibold transition"
                    >
                      Browse grid
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {secondaryItems.map((item) =>
                      "sponsored" in item ? (
                        <div
                          key={item.id}
                          className="lv-surface rounded-[28px] p-6 sm:col-span-2 xl:col-span-4"
                        >
                          <AdSlot slot="gridFeed" label={copy.sponsored} />
                          <p className="lv-text-muted mt-3 text-sm">{copy.sponsoredBody}</p>
                        </div>
                      ) : (
                        <ToolCard
                          key={item.id}
                          tool={item}
                          href={localizePath(`/tool/${item.id}`, activeLocale)}
                        />
                      )
                    )}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="lv-surface rounded-[28px] px-6 py-12 text-center">
              <h1 className="lv-text-primary text-2xl font-black">{copy.noToolsTitle}</h1>
              <p className="lv-text-muted mt-3 text-sm">{copy.noToolsBody}</p>
            </div>
          )}
        </div>
      </section>

      <ExitIntentModal locale={activeLocale} />
    </main>
  );
}
