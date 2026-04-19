"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, Coins, Shield, Sparkles, Wrench } from "lucide-react";

import type { AnalyticsSnapshot } from "@/lib/analytics";
import { AD_SLOT_DEFINITIONS, AD_SLOT_NAMES } from "@/lib/ad-slots";
import type { SiteConfig } from "@/lib/config-provider";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n";

type DashboardTab =
  | "engines"
  | "finance"
  | "monetization"
  | "growth"
  | "seo"
  | "analytics"
  | "viral";

interface LexDashboardProps {
  config: SiteConfig;
  analytics: AnalyticsSnapshot;
}

const TAB_ITEMS: Array<{ id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "engines", label: "Engine Room", icon: Wrench },
  { id: "finance", label: "Finance", icon: Coins },
  { id: "monetization", label: "Ad Manager", icon: Sparkles },
  { id: "growth", label: "Growth Hub", icon: Shield },
  { id: "seo", label: "SEO Shield", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "viral", label: "Viral Engine", icon: Sparkles },
];

const regionNames =
  typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

function toFlag(country: string) {
  if (!/^[A-Z]{2}$/.test(country)) {
    return null;
  }

  return String.fromCodePoint(
    ...country.split("").map((char) => 127397 + char.charCodeAt(0))
  );
}

function formatCountry(country: string) {
  const flag = toFlag(country);
  const name = flag ? regionNames?.of(country) ?? country : country;
  return flag ? `${flag} ${name}` : country;
}

function formatContactEventLabel(status: string) {
  if (status === "receipt-confirmed") {
    return "Receipt Confirmed";
  }

  if (status === "stealth-rejected") {
    return "Stealth Rejected";
  }

  if (status === "rate-limited") {
    return "Rate Limited";
  }

  return status;
}

function formatDashboardTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function LexDashboard({ config, analytics }: LexDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("engines");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    trustpilotUrl: config.trustpilotUrl,
    maintenanceMode: config.maintenanceMode,
    metaTitle: config.metaTitle,
    metaDescription: config.metaDescription,
    openGraphImage: config.openGraphImage,
    ratingModalEnabled: config.ratingModalEnabled,
    exitIntentEnabled: config.exitIntentEnabled,
    exitIntentMessage: config.exitIntentMessage,
    enabledLanguages: config.enabledLanguages.join(", "),
    exchangeMarkupPercent: String(config.exchangeMarkupPercent),
    adSlots: config.adSlots,
    apiKeys: {
      gemini: "",
      cloudconvert: "",
      pdfco: "",
      ocrspace: "",
      mindee: "",
      exchangerate: "",
    },
  });

  const systemHealth = useMemo(
    () =>
      Object.entries(config.apiStatus).map(([key, active]) => ({
        key,
        active,
      })),
    [config.apiStatus]
  );

  const updateField = (name: string, value: string | boolean) => {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateApiKey = (name: keyof typeof formState.apiKeys, value: string) => {
    setFormState((current) => ({
      ...current,
      apiKeys: {
        ...current.apiKeys,
        [name]: value,
      },
    }));
  };

  const toggleLanguage = (locale: string) => {
    setFormState((current) => {
      const active = current.enabledLanguages
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const next = active.includes(locale)
        ? active.filter((value) => value !== locale)
        : [...active, locale];

      return {
        ...current,
        enabledLanguages: next.join(", "),
      };
    });
  };

  const updateAdSlot = (
    slot: keyof typeof formState.adSlots,
    field: "enabled" | "script",
    value: boolean | string
  ) => {
    setFormState((current) => ({
      ...current,
      adSlots: {
        ...current.adSlots,
        [slot]: {
          ...current.adSlots[slot],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/lex/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Could not save the command center settings.");
      }

      setStatusMessage("Settings saved. The live site will refresh shortly.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-[32px] border border-slate-800 bg-slate-950 p-4 text-slate-200">
        <div className="px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Logic Vault
          </p>
          <h1 className="mt-2 text-2xl font-black text-white">Lex Auth</h1>
          <p className="mt-2 text-sm text-slate-400">
            Stealth command center for engines, growth, ads, SEO, and analytics.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form action="/api/lex/logout" method="post" className="mt-6 px-3">
          <button
            type="submit"
            className="w-full rounded-full border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Sign Out
          </button>
        </form>
      </aside>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Live Control
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {TAB_ITEMS.find((tab) => tab.id === activeTab)?.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-full bg-vault-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b557f] disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {statusMessage}
          </div>
        ) : null}

        {activeTab === "engines" ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {systemHealth.map((item) => (
              <div key={item.key} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold capitalize text-slate-950">{item.key}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.active ? "Active" : "Missing"}
                  </span>
                </div>
                <input
                  type="password"
                  value={formState.apiKeys[item.key as keyof typeof formState.apiKeys] ?? ""}
                  onChange={(event) =>
                    updateApiKey(
                      item.key as keyof typeof formState.apiKeys,
                      event.target.value
                    )
                  }
                  placeholder={`Update ${item.key} key`}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
                />
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "finance" ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-950">Exchange Markup (%)</p>
              <input
                type="number"
                value={formState.exchangeMarkupPercent}
                onChange={(event) => updateField("exchangeMarkupPercent", event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
              />
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-950">Exchange Provider</p>
              <p className="mt-4 text-sm text-slate-600">
                exchangerate.host is {config.apiStatus.exchangerate ? "configured" : "not configured"}.
              </p>
            </div>
          </div>
        ) : null}

        {activeTab === "monetization" ? (
          <div className="mt-6 space-y-5">
            {AD_SLOT_NAMES.map((slot) => {
              const settings = formState.adSlots[slot];
              const slotMeta = AD_SLOT_DEFINITIONS[slot];

              return (
                <div key={slot} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{slotMeta.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{slotMeta.description}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(event) =>
                          updateAdSlot(
                            slot as keyof typeof formState.adSlots,
                            "enabled",
                            event.target.checked
                          )
                        }
                      />
                      Enabled
                    </label>
                  </div>
                  <textarea
                    value={settings.script}
                    onChange={(event) =>
                      updateAdSlot(
                        slot as keyof typeof formState.adSlots,
                        "script",
                        event.target.value
                      )
                    }
                    placeholder="Paste AdSense, Mediavine, or sponsor embed code"
                    className="mt-4 h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
                  />
                  <p className="mt-3 text-xs leading-6 text-slate-500">
                    This slot stays hidden until it is enabled and a script is present.
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {activeTab === "growth" ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-5 xl:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">Trustpilot URL</p>
                <input
                  type="url"
                  value={formState.trustpilotUrl}
                  onChange={(event) => updateField("trustpilotUrl", event.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
                />
                <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.ratingModalEnabled}
                    onChange={(event) => updateField("ratingModalEnabled", event.target.checked)}
                  />
                  Rating modal enabled
                </label>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.exitIntentEnabled}
                    onChange={(event) => updateField("exitIntentEnabled", event.target.checked)}
                  />
                  Exit-intent enabled
                </label>
                <textarea
                  value={formState.exitIntentMessage}
                  onChange={(event) => updateField("exitIntentMessage", event.target.value)}
                  placeholder="Before you go..."
                  className="mt-4 h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
                />
              </div>
              <div className="rounded-[24px] border border-cyan-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ecfeff_100%)] p-5">
                <p className="text-sm font-bold text-slate-950">Contact Receipts</p>
                <p className="mt-3 text-3xl font-black text-vault-blue">
                  {analytics.contactReceipts}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Math-verified contact submissions that made it through the live security layer.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">Recent Contact Signals</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Receipt confirmations plus stealth rejects recorded by the contact firewall.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {analytics.recentContactEvents.length > 0 ? (
                  analytics.recentContactEvents.map((event, index) => (
                    <div
                      key={`${event.createdAt}-${event.status}-${index}`}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-100 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {formatContactEventLabel(event.status)}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {event.city ?? "Unknown city"} • {formatDashboardTime(event.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          event.status === "receipt-confirmed"
                            ? "bg-cyan-50 text-cyan-700"
                            : event.status === "rate-limited"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatContactEventLabel(event.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    Contact receipts and stealth rejects will appear here after the first verified
                    submission.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "seo" ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-950">Global Meta Title</p>
              <input
                type="text"
                value={formState.metaTitle}
                onChange={(event) => updateField("metaTitle", event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
              />
              <p className="mt-4 text-sm font-bold text-slate-950">Meta Description</p>
              <textarea
                value={formState.metaDescription}
                onChange={(event) => updateField("metaDescription", event.target.value)}
                className="mt-4 h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
              />
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-950">OpenGraph Image</p>
              <input
                type="text"
                value={formState.openGraphImage}
                onChange={(event) => updateField("openGraphImage", event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-vault-blue"
              />
              <p className="mt-4 text-sm font-bold text-slate-950">Languages</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {SUPPORTED_LOCALES.map((locale) => {
                  const enabled = formState.enabledLanguages
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean)
                    .includes(locale);

                  return (
                    <label
                      key={locale}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleLanguage(locale)}
                      />
                      {LOCALE_LABELS[locale]}
                    </label>
                  );
                })}
              </div>
              <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formState.maintenanceMode}
                  onChange={(event) => updateField("maintenanceMode", event.target.checked)}
                />
                Maintenance mode
              </label>
            </div>
          </div>
        ) : null}

        {activeTab === "analytics" ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">Total Visitors</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{analytics.totalVisitors}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">Active Now</p>
                <p className="mt-3 text-3xl font-black text-emerald-600">{analytics.activeNow}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">Top Region Spread</p>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Anonymous geolocation logs based on hashed IP signals plus Cloudflare and
                  Vercel geo headers.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">Branded Download Reach</p>
                <p className="mt-3 text-3xl font-black text-vault-blue">
                  {analytics.brandedDownloadReach}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">WhatsApp Shares</p>
                <p className="mt-3 text-3xl font-black text-vault-green">
                  {analytics.whatsappShares}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white">
              <p className="text-sm font-bold">Global Hotspots</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] bg-[radial-gradient(circle_at_30%_35%,rgba(50,98,149,0.55),transparent_28%),radial-gradient(circle_at_72%_42%,rgba(229,50,45,0.55),transparent_22%),radial-gradient(circle_at_54%_68%,rgba(16,185,129,0.55),transparent_24%),#0f172a] p-8">
                  <p className="text-sm text-slate-300">
                    Heat-map style overview of active markets using recent visitor logs.
                  </p>
                </div>
                <div className="space-y-4">
                  {analytics.topCountries.map((country) => (
                    <div key={country.country}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{formatCountry(country.country)}</span>
                        <span>{country.percent}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-vault-blue"
                          style={{ width: `${country.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-950">Location Table</p>
              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-0 py-3">Country</th>
                      <th className="px-0 py-3">State / City</th>
                      <th className="px-0 py-3">% Traffic</th>
                      <th className="px-0 py-3">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.locations.map((location) => (
                      <tr key={`${location.country}-${location.region}-${location.city}`} className="border-b border-slate-100">
                        <td className="px-0 py-3 font-semibold text-slate-950">
                          {formatCountry(location.country)}
                        </td>
                        <td className="px-0 py-3">{location.region} / {location.city}</td>
                        <td className="px-0 py-3">{location.percent}%</td>
                        <td className="px-0 py-3">{location.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-950">Top Referring Pages</p>
              <div className="mt-4 space-y-3">
                {analytics.topReferrers.map((referrer) => (
                  <div
                    key={referrer.slug}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-700">{referrer.slug}</span>
                    <span className="font-semibold text-slate-950">{referrer.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "viral" ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">Branded Download Reach</p>
                <p className="mt-3 text-3xl font-black text-vault-blue">
                  {analytics.brandedDownloadReach}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Tracks how many offline files carry the Logic Vault brand after download.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">WhatsApp Shares</p>
                <p className="mt-3 text-3xl font-black text-vault-green">
                  {analytics.whatsappShares}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Counts every shared public calculator result sent through the WhatsApp flow.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">Top Referring Page</p>
                <p className="mt-3 text-lg font-black text-slate-950">
                  {analytics.topReferrers[0]?.slug ?? "No activity yet"}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Shows which bank-conversion or calculator route is currently pulling the most users.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-950">Top Referring Pages</p>
              <div className="mt-4 space-y-3">
                {analytics.topReferrers.length > 0 ? (
                  analytics.topReferrers.map((referrer) => (
                    <div
                      key={referrer.slug}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-slate-700">{referrer.slug}</span>
                      <span className="font-semibold text-slate-950">{referrer.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    Viral metrics will appear here once visitors start sharing and converting.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
