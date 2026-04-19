import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  detectPreferredLocale,
} from "@/lib/locale-config";

function getToolSlug(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "tool" && segments[1]) {
    return segments[1];
  }

  if (segments[0] === "convert" && segments[1]) {
    return segments[1];
  }

  if (segments[0] === "calculators" && segments[1]) {
    return segments[1];
  }

  if (segments[0] === "r" && segments[1]) {
    return "shared-report";
  }

  if (
    SUPPORTED_LOCALES.includes((segments[0] ?? "") as (typeof SUPPORTED_LOCALES)[number]) &&
    segments[1] === "tool" &&
    segments[2]
  ) {
    return segments[2];
  }

  if (
    SUPPORTED_LOCALES.includes((segments[0] ?? "") as (typeof SUPPORTED_LOCALES)[number]) &&
    segments[1] === "convert" &&
    segments[2]
  ) {
    return segments[2];
  }

  return "home";
}

function getActiveLocale(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return SUPPORTED_LOCALES.includes((segment ?? "") as (typeof SUPPORTED_LOCALES)[number])
    ? segment
    : null;
}

async function hashIp(ip: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function logVisitor(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    return;
  }

  const cloudflare = (request as NextRequest & {
    cf?: { city?: string; country?: string; regionCode?: string };
  }).cf;
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/lex") ||
    pathname.startsWith("/_next")
  ) {
    return;
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";

  if (!ip) {
    return;
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/visitor_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
      body: JSON.stringify({
        country:
          cloudflare?.country ??
          request.headers.get("cf-ipcountry") ??
          request.headers.get("x-vercel-ip-country"),
        city: cloudflare?.city ?? request.headers.get("x-vercel-ip-city"),
        region:
          cloudflare?.regionCode ??
          request.headers.get("cf-region-code") ??
          request.headers.get("x-vercel-ip-country-region"),
        ip_hashed: await hashIp(ip),
        tool_used: getToolSlug(pathname),
      }),
    });
  } catch {
    // Silent logging failure keeps user requests unaffected.
  }
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/lex") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin")
  ) {
    event.waitUntil(logVisitor(request));
    return NextResponse.next();
  }

  const activeLocale = getActiveLocale(pathname);
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const savedLocale = SUPPORTED_LOCALES.includes(
    (localeCookie ?? "") as (typeof SUPPORTED_LOCALES)[number]
  )
    ? localeCookie
    : null;

  if (!activeLocale) {
    const preferredLocale =
      (savedLocale as (typeof SUPPORTED_LOCALES)[number] | null) ??
      detectPreferredLocale(request.headers.get("accept-language"), SUPPORTED_LOCALES);

    if (preferredLocale && preferredLocale !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale}${pathname === "/" ? "" : pathname}`;
      const response = NextResponse.redirect(url);

      response.cookies.set(LOCALE_COOKIE_NAME, preferredLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });

      event.waitUntil(logVisitor(request));
      return response;
    }
  }

  const response = NextResponse.next();

  if (activeLocale) {
    response.cookies.set(LOCALE_COOKIE_NAME, activeLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  event.waitUntil(logVisitor(request));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|ads.txt).*)",
  ],
};
