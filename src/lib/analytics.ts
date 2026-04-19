import "server-only";

interface VisitorLogRow {
  country: string | null;
  city: string | null;
  region: string | null;
  files_branded_count: number | null;
  created_at: string;
}

interface ActivityLogRow {
  tool_slug: string | null;
  file_type: string | null;
  city: string | null;
  created_at: string;
}

export interface AnalyticsSnapshot {
  totalVisitors: number;
  activeNow: number;
  brandedDownloadReach: number;
  whatsappShares: number;
  contactReceipts: number;
  topCountries: Array<{ country: string; count: number; percent: number }>;
  locations: Array<{ country: string; city: string; region: string; count: number; percent: number }>;
  topReferrers: Array<{ slug: string; count: number }>;
  recentContactEvents: Array<{ status: string; city: string | null; createdAt: string }>;
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeGeoValue(value: string | null, fallback = "Unknown") {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  if (/^[a-z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return titleCase(trimmed);
}

function buildPercent(count: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Number(((count / total) * 100).toFixed(1));
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    return {
      totalVisitors: 0,
      activeNow: 0,
      brandedDownloadReach: 0,
      whatsappShares: 0,
      contactReceipts: 0,
      topCountries: [],
      locations: [],
      topReferrers: [],
      recentContactEvents: [],
    };
  }

  try {
    const [response, activityResponse] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/visitor_logs?select=country,city,region,created_at,files_branded_count&order=created_at.desc&limit=750`,
        {
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
          },
          next: { revalidate: 60, tags: ["visitor-logs"] },
        }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/activity_log?select=tool_slug,file_type,city,created_at&order=created_at.desc&limit=750`,
        {
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
          },
          next: { revalidate: 60, tags: ["visitor-logs"] },
        }
      ),
    ]);

    if (!response.ok) {
      throw new Error("Could not load analytics.");
    }

    const rows = (await response.json()) as VisitorLogRow[];
    const activityRows = activityResponse.ok
      ? ((await activityResponse.json()) as ActivityLogRow[])
      : [];
    const totalVisitors = rows.length;
    const now = Date.now();
    const activeNow = rows.filter(
      (row) => now - new Date(row.created_at).getTime() <= 5 * 60 * 1000
    ).length;
    const brandedDownloadReach = rows.reduce(
      (total, row) => total + (row.files_branded_count ?? 0),
      0
    );

    const countryCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    const referrerCounts = new Map<string, number>();
    let whatsappShares = 0;
    let contactReceipts = 0;

    rows.forEach((row) => {
      const country = normalizeGeoValue(row.country);
      const city = normalizeGeoValue(row.city);
      const region = normalizeGeoValue(row.region);
      const locationKey = `${country}|${region}|${city}`;

      countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
      locationCounts.set(locationKey, (locationCounts.get(locationKey) ?? 0) + 1);
    });

    activityRows.forEach((row) => {
      if (row.tool_slug) {
        referrerCounts.set(row.tool_slug, (referrerCounts.get(row.tool_slug) ?? 0) + 1);
      }

      if (row.file_type === "whatsapp-share") {
        whatsappShares += 1;
      }

      if (row.tool_slug === "contact-form" && row.file_type === "receipt-confirmed") {
        contactReceipts += 1;
      }
    });

    const topCountries = [...countryCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([country, count]) => ({
        country,
        count,
        percent: buildPercent(count, totalVisitors),
      }));

    const locations = [...locationCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 12)
      .map(([locationKey, count]) => {
        const [country, region, city] = locationKey.split("|");

        return {
          country,
          region,
          city,
          count,
          percent: buildPercent(count, totalVisitors),
        };
      });

    const topReferrers = [...referrerCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([slug, count]) => ({ slug, count }));

    const recentContactEvents = activityRows
      .filter((row) => row.tool_slug === "contact-form")
      .slice(0, 8)
      .map((row) => ({
        status: row.file_type ?? "event",
        city: row.city ?? null,
        createdAt: row.created_at,
      }));

    return {
      totalVisitors,
      activeNow,
      brandedDownloadReach,
      whatsappShares,
      contactReceipts,
      topCountries,
      locations,
      topReferrers,
      recentContactEvents,
    };
  } catch {
    return {
      totalVisitors: 0,
      activeNow: 0,
      brandedDownloadReach: 0,
      whatsappShares: 0,
      contactReceipts: 0,
      topCountries: [],
      locations: [],
      topReferrers: [],
      recentContactEvents: [],
    };
  }
}
