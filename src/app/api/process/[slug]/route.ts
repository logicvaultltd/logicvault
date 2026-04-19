import { NextResponse } from "next/server";

import { processTool, type UploadedToolFile } from "@/lib/engine";
import { buildContentDisposition } from "@/lib/branding";
import { getSiteConfig } from "@/lib/config-provider";
import { toVaultErrorMessage } from "@/lib/error-copy";
import { getProviderMaintenanceMessage, isProviderAvailable } from "@/lib/provider-status";
import { incrementBrandedDownloadCount, logActivityEvent } from "@/lib/supabase-data";
import { findToolBySlug } from "@/lib/tools-registry";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const tool = findToolBySlug(slug);

  if (!tool) {
    return NextResponse.json({ error: "We could not find that tool." }, { status: 404 });
  }

  const siteConfig = await getSiteConfig();

  if (siteConfig.maintenanceMode) {
    return NextResponse.json(
      { error: "The Vault encountered a secure hiccup. Please try again." },
      { status: 503 }
    );
  }

  if (!isProviderAvailable(tool.provider, siteConfig.apiStatus)) {
    return NextResponse.json(
      { error: getProviderMaintenanceMessage(tool.provider) },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const options = Object.fromEntries(
      [...formData.entries()].filter(([, value]) => typeof value === "string")
    ) as Record<string, string>;
    const files = await Promise.all(
      formData
        .getAll("files")
        .filter((entry): entry is File => entry instanceof File)
        .map(async (file): Promise<UploadedToolFile> => ({
          name: file.name,
          type: file.type,
          data: Buffer.from(await file.arrayBuffer()),
        }))
    );
    const result = await processTool(tool.id, files, options);
    const analyticsSlug = options.referrer_slug?.trim() || tool.id;
    await Promise.allSettled([
      incrementBrandedDownloadCount(request, analyticsSlug),
      logActivityEvent({
        city: request.headers.get("x-vercel-ip-city") ?? request.headers.get("cf-ipcity"),
        fileType: result.filename.split(".").pop() ?? null,
        toolSlug: analyticsSlug,
      }),
    ]);

    return new Response(new Uint8Array(result.data), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": buildContentDisposition(result.filename),
      },
    });
  } catch (error) {
    const message = toVaultErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
