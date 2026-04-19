import { NextResponse } from "next/server";

import { getAdminCookieName, verifyAdminToken } from "@/lib/admin-auth";
import { upsertSiteConfigEntries } from "@/lib/config-provider";

interface ConfigPayload {
  trustpilotUrl: string;
  maintenanceMode: boolean;
  metaTitle: string;
  metaDescription: string;
  openGraphImage: string;
  ratingModalEnabled: boolean;
  exitIntentEnabled: boolean;
  exitIntentMessage: string;
  enabledLanguages: string;
  exchangeMarkupPercent: string;
  adSlots: Record<string, { enabled: boolean; script: string }>;
  apiKeys: Record<string, string>;
}

export async function POST(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${getAdminCookieName()}=`))
    ?.split("=")[1];

  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ConfigPayload;
  const rows = [
    { key: "trustpilot_url", value: payload.trustpilotUrl, category: "GROWTH" },
    { key: "maintenance_mode", value: String(payload.maintenanceMode), category: "SEO" },
    { key: "global_meta_title", value: payload.metaTitle, category: "SEO" },
    { key: "global_meta_description", value: payload.metaDescription, category: "SEO" },
    { key: "open_graph_image", value: payload.openGraphImage, category: "SEO" },
    { key: "rating_modal_enabled", value: String(payload.ratingModalEnabled), category: "GROWTH" },
    { key: "exit_intent_enabled", value: String(payload.exitIntentEnabled), category: "GROWTH" },
    { key: "exit_intent_message", value: payload.exitIntentMessage, category: "GROWTH" },
    { key: "enabled_languages", value: JSON.stringify(payload.enabledLanguages.split(",").map((item) => item.trim()).filter(Boolean)), category: "SEO" },
    { key: "exchange_markup_percent", value: payload.exchangeMarkupPercent, category: "FINANCE" },
    ...Object.entries(payload.adSlots).flatMap(([slot, settings]) => [
      { key: `ad_slot_${slot}_enabled`, value: String(settings.enabled), category: "ADS" },
      { key: `ad_slot_${slot}_script`, value: settings.script, category: "ADS" },
    ]),
    ...Object.entries(payload.apiKeys)
      .filter(([, value]) => value.trim().length > 0)
      .map(([key, value]) => ({ key: `${key}_key`, value, category: "API" })),
  ];

  const result = await upsertSiteConfigEntries(rows);

  if (!result.ok) {
    return NextResponse.json(
      { error: "Could not write the site configuration." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
