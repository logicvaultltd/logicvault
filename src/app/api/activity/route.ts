import { NextResponse } from "next/server";

import { fetchActivityFeed, logActivityEvent } from "@/lib/supabase-data";

export async function GET() {
  const items = await fetchActivityFeed(10);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { event?: string; toolSlug?: string };

  await logActivityEvent({
    city: null,
    fileType: body.event ?? "event",
    toolSlug: body.toolSlug ?? "unknown",
  });

  return NextResponse.json({ ok: true });
}
