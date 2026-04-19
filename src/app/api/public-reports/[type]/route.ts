import { NextResponse } from "next/server";

import { buildPublicCalculatorTitle, isPublicCalculatorType } from "@/lib/public-calculators";
import { createPublicReport } from "@/lib/supabase-data";

export const runtime = "edge";

export async function POST(
  request: Request,
  context: { params: Promise<{ type: string }> }
) {
  const { type } = await context.params;

  if (!isPublicCalculatorType(type)) {
    return NextResponse.json({ error: "Unsupported calculator type." }, { status: 404 });
  }

  const body = (await request.json()) as {
    inputs?: Record<string, string | number>;
  };

  const result = await createPublicReport({
    reportType: type,
    inputs: body.inputs ?? {},
    title: buildPublicCalculatorTitle(type),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Could not create the public calculator link." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: result.id,
    url: `/calculators/${type}/${result.id}`,
  });
}
