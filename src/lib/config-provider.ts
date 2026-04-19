import "server-only";

import type { AdSlotName } from "@/lib/ad-slots";

export interface SiteConfig {
  trustpilotUrl: string;
  maintenanceMode: boolean;
  metaTitle: string;
  metaDescription: string;
  openGraphImage: string;
  ratingModalEnabled: boolean;
  exitIntentEnabled: boolean;
  exitIntentMessage: string;
  enabledLanguages: string[];
  exchangeMarkupPercent: number;
  adSlots: Record<AdSlotName, { enabled: boolean; script: string }>;
  apiStatus: {
    gemini: boolean;
    cloudconvert: boolean;
    pdfco: boolean;
    ocrspace: boolean;
    mindee: boolean;
    exchangerate: boolean;
  };
}

interface SiteConfigRow {
  key: string;
  value: string;
  category: string;
}

const CONFIG_TAG = "site-config";
const DEFAULT_SITE_CONFIG: SiteConfig = {
  trustpilotUrl: process.env.NEXT_PUBLIC_TRUSTPILOT_URL ?? "https://www.trustpilot.com/",
  maintenanceMode: false,
  metaTitle: "Logic Vault | Every Financial & PDF Tool, 100% Free & Secure",
  metaDescription:
    "Process Account Statements, Merge PDFs, and convert financial data locally. No data leaves your computer. Built for the Global Citizen.",
  openGraphImage: "/extension/icons/icon128.png",
  ratingModalEnabled: true,
  exitIntentEnabled: true,
  exitIntentMessage:
    "Bookmark Logic Vault or leave a quick rating so you can get back to your tools fast.",
  enabledLanguages: [
    "en",
    "es",
    "fr",
    "pt",
    "zh",
    "ar",
    "de",
    "hi",
    "it",
    "ja",
    "nl",
    "id",
    "ko",
    "tr",
  ],
  exchangeMarkupPercent: 0,
  adSlots: {
    leaderboard: { enabled: false, script: "" },
    gridFeed: { enabled: false, script: "" },
    engagement: { enabled: false, script: "" },
    action: { enabled: false, script: "" },
    contentInline: { enabled: false, script: "" },
    stickyFooter: { enabled: false, script: "" },
  },
  apiStatus: {
    gemini: Boolean(process.env.GEMINI_API_KEY),
    cloudconvert: Boolean(process.env.CLOUDCONVERT_API_KEY),
    pdfco: Boolean(process.env.PDFCO_API_KEY),
    ocrspace: Boolean(process.env.OCR_SPACE_API_KEY),
    mindee: Boolean(process.env.MINDEE_API_KEY),
    exchangerate: Boolean(process.env.EXCHANGERATE_API_KEY),
  },
};

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function parseNumber(value: string | undefined, fallback: number) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseJsonArray(value: string | undefined, fallback: string[]) {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as string[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function fetchSiteConfigRows() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = serviceRole ?? anonKey;

  if (!supabaseUrl || !apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_config?select=key,value,category`,
      {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        next: {
          revalidate: 60,
          tags: [CONFIG_TAG],
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as SiteConfigRow[];
  } catch {
    return [];
  }
}

function rowsToConfig(rows: SiteConfigRow[]) {
  const lookup = new Map(rows.map((row) => [row.key, row.value]));
  const databaseMaintenanceMode = parseBoolean(
    lookup.get("maintenance_mode"),
    DEFAULT_SITE_CONFIG.maintenanceMode
  );
  const maintenanceMode =
    process.env.NODE_ENV === "production" ? databaseMaintenanceMode : false;

  return {
    trustpilotUrl:
      lookup.get("trustpilot_url") ?? DEFAULT_SITE_CONFIG.trustpilotUrl,
    maintenanceMode,
    metaTitle: lookup.get("global_meta_title") ?? DEFAULT_SITE_CONFIG.metaTitle,
    metaDescription:
      lookup.get("global_meta_description") ?? DEFAULT_SITE_CONFIG.metaDescription,
    openGraphImage:
      lookup.get("open_graph_image") ?? DEFAULT_SITE_CONFIG.openGraphImage,
    ratingModalEnabled: parseBoolean(
      lookup.get("rating_modal_enabled"),
      DEFAULT_SITE_CONFIG.ratingModalEnabled
    ),
    exitIntentEnabled: parseBoolean(
      lookup.get("exit_intent_enabled"),
      DEFAULT_SITE_CONFIG.exitIntentEnabled
    ),
    exitIntentMessage:
      lookup.get("exit_intent_message") ?? DEFAULT_SITE_CONFIG.exitIntentMessage,
    enabledLanguages: parseJsonArray(
      lookup.get("enabled_languages"),
      DEFAULT_SITE_CONFIG.enabledLanguages
    ),
    exchangeMarkupPercent: parseNumber(
      lookup.get("exchange_markup_percent"),
      DEFAULT_SITE_CONFIG.exchangeMarkupPercent
    ),
    adSlots: {
      leaderboard: {
        enabled: parseBoolean(
          lookup.get("ad_slot_leaderboard_enabled"),
          DEFAULT_SITE_CONFIG.adSlots.leaderboard.enabled
        ),
        script:
          lookup.get("ad_slot_leaderboard_script") ??
          DEFAULT_SITE_CONFIG.adSlots.leaderboard.script,
      },
      gridFeed: {
        enabled: parseBoolean(
          lookup.get("ad_slot_gridFeed_enabled") ?? lookup.get("ad_slot_grid_feed_enabled"),
          DEFAULT_SITE_CONFIG.adSlots.gridFeed.enabled
        ),
        script:
          lookup.get("ad_slot_gridFeed_script") ??
          lookup.get("ad_slot_grid_feed_script") ??
          DEFAULT_SITE_CONFIG.adSlots.gridFeed.script,
      },
      engagement: {
        enabled: parseBoolean(
          lookup.get("ad_slot_engagement_enabled"),
          DEFAULT_SITE_CONFIG.adSlots.engagement.enabled
        ),
        script:
          lookup.get("ad_slot_engagement_script") ??
          DEFAULT_SITE_CONFIG.adSlots.engagement.script,
      },
      action: {
        enabled: parseBoolean(
          lookup.get("ad_slot_action_enabled"),
          DEFAULT_SITE_CONFIG.adSlots.action.enabled
        ),
        script:
          lookup.get("ad_slot_action_script") ??
          DEFAULT_SITE_CONFIG.adSlots.action.script,
      },
      contentInline: {
        enabled: parseBoolean(
          lookup.get("ad_slot_contentInline_enabled") ??
            lookup.get("ad_slot_content_inline_enabled"),
          DEFAULT_SITE_CONFIG.adSlots.contentInline.enabled
        ),
        script:
          lookup.get("ad_slot_contentInline_script") ??
          lookup.get("ad_slot_content_inline_script") ??
          DEFAULT_SITE_CONFIG.adSlots.contentInline.script,
      },
      stickyFooter: {
        enabled: parseBoolean(
          lookup.get("ad_slot_sticky_footer_enabled"),
          DEFAULT_SITE_CONFIG.adSlots.stickyFooter.enabled
        ),
        script:
          lookup.get("ad_slot_sticky_footer_script") ??
          DEFAULT_SITE_CONFIG.adSlots.stickyFooter.script,
      },
    },
    apiStatus: {
      gemini: Boolean(lookup.get("gemini_key") || process.env.GEMINI_API_KEY),
      cloudconvert: Boolean(
        lookup.get("cloudconvert_key") || process.env.CLOUDCONVERT_API_KEY
      ),
      pdfco: Boolean(lookup.get("pdfco_key") || process.env.PDFCO_API_KEY),
      ocrspace: Boolean(
        lookup.get("ocrspace_key") || process.env.OCR_SPACE_API_KEY
      ),
      mindee: Boolean(lookup.get("mindee_key") || process.env.MINDEE_API_KEY),
      exchangerate: Boolean(
        lookup.get("exchangerate_key") || process.env.EXCHANGERATE_API_KEY
      ),
    },
  } satisfies SiteConfig;
}

export async function getSiteConfig() {
  const rows = await fetchSiteConfigRows();
  return rows.length > 0 ? rowsToConfig(rows) : DEFAULT_SITE_CONFIG;
}

export async function upsertSiteConfigEntries(rows: SiteConfigRow[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole || rows.length === 0) {
    return { ok: false };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/site_config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    });

    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
}

export function getConfigTag() {
  return CONFIG_TAG;
}
