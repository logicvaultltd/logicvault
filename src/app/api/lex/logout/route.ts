import { NextResponse } from "next/server";

import { getAdminCookieName } from "@/lib/admin-auth";

export const runtime = "edge";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/lex/auth", request.url));
  response.cookies.set({
    name: getAdminCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
