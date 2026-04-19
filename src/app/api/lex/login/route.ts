import { NextResponse } from "next/server";

import {
  createAdminToken,
  getAdminCookieName,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export const runtime = "edge";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const loginUrl = new URL("/lex/auth", request.url);

  if (!(await verifyAdminCredentials(email, password))) {
    loginUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.set({
    name: getAdminCookieName(),
    value: await createAdminToken(email),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
