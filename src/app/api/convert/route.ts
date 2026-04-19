import { NextResponse } from "next/server";

function buildLaunchUrl(request: Request, source?: string | null) {
  const redirect = new URL("/tool/statement-to-csv", request.url);

  if (source?.trim()) {
    redirect.searchParams.set("source", source.trim());
  }

  return redirect;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(buildLaunchUrl(request, url.searchParams.get("source")));
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let source: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as
      | { source?: string; sourceUrl?: string }
      | null;
    source = body?.sourceUrl ?? body?.source ?? null;
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    source = String(formData.get("sourceUrl") ?? formData.get("source") ?? "");
  }

  const launchUrl = buildLaunchUrl(request, source);

  return NextResponse.json({
    ok: true,
    launchUrl: `${launchUrl.pathname}${launchUrl.search}`,
  });
}
