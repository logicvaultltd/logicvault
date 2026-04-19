import "server-only";

import {
  CONTACT_RATE_LIMIT_MAX,
  CONTACT_RATE_LIMIT_WINDOW_MS,
  getRequestIp,
  hashValue,
} from "@/lib/security";

interface ActivityLogRow {
  id: number;
  city: string | null;
  file_type: string | null;
  tool_slug: string | null;
  created_at: string;
}

interface ToolUsageRow {
  tool_slug?: string | null;
  tool_used?: string | null;
}

type ContactSubmissionStatus = "accepted" | "stealth" | "rate-limited";

const inMemoryContactAttempts = new Map<string, number[]>();

function getSupabaseCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    return null;
  }

  return { supabaseUrl, serviceRole };
}

async function supabaseRequest(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
) {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    return null;
  }

  try {
    const response = await fetch(`${credentials.supabaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        apikey: credentials.serviceRole,
        Authorization: `Bearer ${credentials.serviceRole}`,
        ...(init?.headers ?? {}),
      },
    });

    return response;
  } catch {
    return null;
  }
}

function getCityFromRequest(request: Request) {
  return request.headers.get("x-vercel-ip-city") ?? request.headers.get("cf-ipcity");
}

function recordInMemoryAttempt(ipHashed: string, timestamp: number) {
  const windowStart = timestamp - CONTACT_RATE_LIMIT_WINDOW_MS;
  const existing = inMemoryContactAttempts.get(ipHashed) ?? [];
  const next = [...existing.filter((value) => value >= windowStart), timestamp];
  inMemoryContactAttempts.set(ipHashed, next);
}

function countInMemoryAttempts(ipHashed: string, timestamp: number) {
  const windowStart = timestamp - CONTACT_RATE_LIMIT_WINDOW_MS;
  const existing = inMemoryContactAttempts.get(ipHashed) ?? [];
  const next = existing.filter((value) => value >= windowStart);
  inMemoryContactAttempts.set(ipHashed, next);
  return next.length;
}

export async function incrementBrandedDownloadCount(request: Request, toolUsed: string) {
  const ip = getRequestIp(request);

  if (!ip) {
    return;
  }

  const ipHashed = await hashValue(ip);
  const existingResponse = await supabaseRequest(
    `/rest/v1/visitor_logs?select=id,files_branded_count&ip_hashed=eq.${ipHashed}&order=created_at.desc&limit=1`
  );

  if (!existingResponse?.ok) {
    return;
  }

  const existingRows = (await existingResponse.json()) as Array<{
    id: number;
    files_branded_count: number;
  }>;

  if (existingRows[0]) {
    await supabaseRequest(`/rest/v1/visitor_logs?id=eq.${existingRows[0].id}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        files_branded_count: (existingRows[0].files_branded_count ?? 0) + 1,
        tool_used: toolUsed,
      }),
    });
    return;
  }

  await supabaseRequest("/rest/v1/visitor_logs", {
    method: "POST",
    body: JSON.stringify({
      ip_hashed: ipHashed,
      tool_used: toolUsed,
      country: request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry"),
      city: getCityFromRequest(request),
      region:
        request.headers.get("x-vercel-ip-country-region") ??
        request.headers.get("cf-region-code"),
      files_branded_count: 1,
    }),
  });
}

export async function logActivityEvent({
  city,
  fileType,
  toolSlug,
}: {
  city?: string | null;
  fileType?: string | null;
  toolSlug?: string | null;
}) {
  const body = JSON.stringify({
    city: city ?? null,
    file_type: fileType ?? null,
    tool_slug: toolSlug ?? null,
  });
  const usageResponse = await supabaseRequest("/rest/v1/usage_log", {
    method: "POST",
    body,
  });

  if (usageResponse?.ok) {
    return;
  }

  const pascalUsageResponse = await supabaseRequest("/rest/v1/UsageLog", {
    method: "POST",
    body,
  });

  if (pascalUsageResponse?.ok) {
    return;
  }

  await supabaseRequest("/rest/v1/activity_log", {
    method: "POST",
    body,
  });
}

export async function fetchActivityFeed(limit = 8) {
  const query = `select=id,city,file_type,tool_slug,created_at&order=created_at.desc&limit=${limit}`;
  const activitySources = [
    `/rest/v1/usage_log?${query}`,
    `/rest/v1/UsageLog?${query}`,
    `/rest/v1/activity_log?${query}`,
  ];
  let response: Response | null = null;

  for (const source of activitySources) {
    response = await supabaseRequest(source);

    if (response?.ok) {
      break;
    }
  }

  if (!response?.ok) {
    return [];
  }

  return (await response.json()) as ActivityLogRow[];
}

export async function fetchToolPopularityCounts(sampleSize = 800) {
  const usageSources = [
    { table: "usage_log", column: "tool_slug" },
    { table: "UsageLog", column: "tool_slug" },
    { table: "analytics", column: "tool_slug" },
    { table: "Analytics", column: "tool_slug" },
    { table: "analytics", column: "tool_used" },
    { table: "Analytics", column: "tool_used" },
    { table: "activity_log", column: "tool_slug" },
  ];
  const counts: Record<string, number> = {};

  for (const source of usageSources) {
    const orderedPath =
      `/rest/v1/${source.table}?select=${source.column}&${source.column}=not.is.null` +
      `&order=created_at.desc&limit=${sampleSize}`;
    let response = await supabaseRequest(orderedPath, {
      next: {
        revalidate: 60,
        tags: ["tool-popularity"],
      },
    });

    if (!response?.ok) {
      response = await supabaseRequest(
        `/rest/v1/${source.table}?select=${source.column}&${source.column}=not.is.null&limit=${sampleSize}`,
        {
          next: {
            revalidate: 60,
            tags: ["tool-popularity"],
          },
        }
      );
    }

    if (!response?.ok) {
      continue;
    }

    const rows = (await response.json()) as ToolUsageRow[];

    rows.forEach((row) => {
      const slug = (row.tool_slug ?? row.tool_used)?.trim();

      if (slug) {
        counts[slug] = (counts[slug] ?? 0) + 1;
      }
    });

    if (Object.keys(counts).length > 0) {
      break;
    }
  }

  return counts;
}

export async function canSubmitContactForm(request: Request) {
  const ip = getRequestIp(request);
  const now = Date.now();

  if (!ip) {
    return {
      allowed: true,
      attempts: 0,
      retryAfterSeconds: 0,
    };
  }

  const ipHashed = await hashValue(ip);
  const since = new Date(now - CONTACT_RATE_LIMIT_WINDOW_MS).toISOString();
  const response = await supabaseRequest(
    `/rest/v1/contact_submission_logs?select=id,created_at&ip_hashed=eq.${ipHashed}&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=${CONTACT_RATE_LIMIT_MAX}`
  );

  if (response?.ok) {
    const rows = (await response.json()) as Array<{ id: number; created_at: string }>;
    const attempts = rows.length;
    const oldestAttempt = rows.at(-1)?.created_at;
    const retryAfterSeconds =
      attempts >= CONTACT_RATE_LIMIT_MAX && oldestAttempt
        ? Math.max(
            60,
            Math.ceil(
              (new Date(oldestAttempt).getTime() + CONTACT_RATE_LIMIT_WINDOW_MS - now) / 1000
            )
          )
        : 0;

    return {
      allowed: attempts < CONTACT_RATE_LIMIT_MAX,
      attempts,
      retryAfterSeconds,
    };
  }

  const attempts = countInMemoryAttempts(ipHashed, now);
  return {
    allowed: attempts < CONTACT_RATE_LIMIT_MAX,
    attempts,
    retryAfterSeconds:
      attempts >= CONTACT_RATE_LIMIT_MAX
        ? Math.ceil(CONTACT_RATE_LIMIT_WINDOW_MS / 1000)
        : 0,
  };
}

export async function recordContactSubmission({
  request,
  purpose,
  status,
}: {
  request: Request;
  purpose: string;
  status: ContactSubmissionStatus;
}) {
  const ip = getRequestIp(request);
  const city = getCityFromRequest(request);
  const eventName =
    status === "accepted"
      ? "receipt-confirmed"
      : status === "rate-limited"
        ? "rate-limited"
        : "stealth-rejected";

  if (ip) {
    const ipHashed = await hashValue(ip);
    const timestamp = Date.now();
    const response = await supabaseRequest("/rest/v1/contact_submission_logs", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ip_hashed: ipHashed,
        status,
        purpose,
        city,
      }),
    });

    if (!response?.ok) {
      recordInMemoryAttempt(ipHashed, timestamp);
    }
  }

  await logActivityEvent({
    city,
    fileType: eventName,
    toolSlug: "contact-form",
  });
}

export async function createPublicReport({
  reportType,
  inputs,
  title,
}: {
  reportType: string;
  inputs: Record<string, string | number>;
  title: string;
}) {
  const id = crypto.randomUUID().slice(0, 12);
  const response = await supabaseRequest("/rest/v1/public_reports", {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      id,
      report_type: reportType,
      inputs,
      title,
    }),
  });

  return {
    id,
    ok: Boolean(response?.ok),
  };
}

export async function fetchPublicReport(id: string) {
  const response = await supabaseRequest(
    `/rest/v1/public_reports?select=id,report_type,inputs,title,created_at&id=eq.${id}&limit=1`
  );

  if (!response?.ok) {
    return null;
  }

  const rows = (await response.json()) as Array<{
    id: string;
    report_type: string;
    inputs: Record<string, string | number>;
    title: string;
    created_at: string;
  }>;

  return rows[0] ?? null;
}
