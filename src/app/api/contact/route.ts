import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import {
  CONTACT_SESSION_COOKIE_NAME,
  createMathCaptcha,
  createSecuritySessionId,
  readCookieValue,
  sanitizeContactText,
  verifyMathCaptcha,
} from "@/lib/security";
import { canSubmitContactForm, recordContactSubmission } from "@/lib/supabase-data";

const OPS_EMAIL = "ops@logicvault.org";
const CONTACT_SUCCESS_MESSAGE =
  "Transmission received. Thank you for reaching out to Logic Vault.";
const CONTACT_SESSION_MAX_AGE = 60 * 60 * 12;
const ALLOWED_PURPOSES = new Set([
  "General Inquiry",
  "Partnership",
  "Ad Placement",
  "Technical Support",
  "Enterprise Workflow",
  "Press & Media",
]);

interface ContactPayload {
  name?: string;
  email?: string;
  company?: string;
  purpose?: string;
  message?: string;
  website?: string;
  captchaAnswer?: string;
  captchaLeft?: number;
  captchaRight?: number;
  captchaToken?: string;
}

interface SanitizedContactPayload {
  name: string;
  email: string;
  company: string;
  purpose: string;
  message: string;
}

export const runtime = "nodejs";

function buildMailBody(payload: SanitizedContactPayload) {
  return [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company || "Not provided"}`,
    `Purpose: ${payload.purpose}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");
}

function buildMailtoUrl(payload: SanitizedContactPayload) {
  const subject = `[Logic Vault] ${payload.purpose} from ${payload.name}`;
  return `mailto:${OPS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    buildMailBody(payload)
  )}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.CONTACT_FROM_EMAIL);
}

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
}

function buildSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: CONTACT_SESSION_MAX_AGE,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function buildStealthSuccessResponse() {
  return NextResponse.json({
    ok: true,
    mode: "noop",
    message: CONTACT_SUCCESS_MESSAGE,
  });
}

function readSessionId(request: Request) {
  return readCookieValue(request.headers.get("cookie"), CONTACT_SESSION_COOKIE_NAME);
}

export async function GET(request: Request) {
  const existingSessionId = readSessionId(request);
  const sessionId = existingSessionId ?? createSecuritySessionId();
  const challenge = await createMathCaptcha(sessionId);
  const response = NextResponse.json({
    ok: true,
    challenge,
  });

  if (!existingSessionId) {
    response.cookies.set(CONTACT_SESSION_COOKIE_NAME, sessionId, buildSessionCookieOptions());
  }

  return response;
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "We could not read that message. Please try again." },
      { status: 400 }
    );
  }

  const rateLimit = await canSubmitContactForm(request);

  if (!rateLimit.allowed) {
    await recordContactSubmission({
      request,
      purpose: sanitizeContactText(body.purpose, 80) || "Unknown",
      status: "rate-limited",
    });

    return NextResponse.json(
      {
        ok: false,
        message: `Too many messages came from this connection. Please wait about ${Math.ceil(
          Math.max(rateLimit.retryAfterSeconds, 60) / 60
        )} minute(s) and try again.`,
      },
      { status: 429 }
    );
  }

  const purpose = sanitizeContactText(body.purpose, 80);

  if (sanitizeContactText(body.website, 200)) {
    await recordContactSubmission({
      request,
      purpose: purpose || "Unknown",
      status: "stealth",
    });

    return buildStealthSuccessResponse();
  }

  const sessionId = readSessionId(request);

  const isHumanVerified =
    Boolean(sessionId) &&
    (await verifyMathCaptcha({
      sessionId: sessionId ?? "",
      left: Number(body.captchaLeft),
      right: Number(body.captchaRight),
      answer: body.captchaAnswer ?? "",
      token: body.captchaToken ?? "",
    }));

  if (!isHumanVerified) {
    await recordContactSubmission({
      request,
      purpose: purpose || "Unknown",
      status: "stealth",
    });

    return buildStealthSuccessResponse();
  }

  const payload: SanitizedContactPayload = {
    name: sanitizeContactText(body.name, 120),
    email: sanitizeContactText(body.email, 160),
    company: sanitizeContactText(body.company, 160),
    purpose,
    message: sanitizeContactText(body.message, 4000, { preserveNewlines: true }),
  };

  if (!payload.name || !payload.email || !payload.message) {
    return NextResponse.json(
      { ok: false, message: "Please complete your name, email, and message." },
      { status: 400 }
    );
  }

  if (!isEmail(payload.email)) {
    return NextResponse.json(
      { ok: false, message: "Please use a valid email address." },
      { status: 400 }
    );
  }

  if (!ALLOWED_PURPOSES.has(payload.purpose)) {
    return NextResponse.json(
      { ok: false, message: "Please choose a valid purpose for your request." },
      { status: 400 }
    );
  }

  const subject = `[Logic Vault] ${payload.purpose} from ${payload.name}`;
  const text = buildMailBody(payload);

  if (!hasSmtpConfig()) {
    await recordContactSubmission({
      request,
      purpose: payload.purpose,
      status: "accepted",
    });

    return NextResponse.json({
      ok: true,
      mode: "mailto",
      message:
        "Transmission received. Your mail app is opening with a ready-to-send draft for the Logic Vault operations team.",
      mailtoUrl: buildMailtoUrl(payload),
    });
  }

  try {
    const transporter = buildTransport();

    await transporter.sendMail({
      to: process.env.CONTACT_TO_EMAIL ?? OPS_EMAIL,
      from: process.env.CONTACT_FROM_EMAIL ?? OPS_EMAIL,
      replyTo: payload.email,
      subject,
      text,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#111827;">
          <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(payload.company || "Not provided")}</p>
          <p><strong>Purpose:</strong> ${escapeHtml(payload.purpose)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    await recordContactSubmission({
      request,
      purpose: payload.purpose,
      status: "accepted",
    });

    return NextResponse.json({
      ok: true,
      mode: "smtp",
      message: CONTACT_SUCCESS_MESSAGE,
    });
  } catch {
    await recordContactSubmission({
      request,
      purpose: payload.purpose,
      status: "accepted",
    });

    return NextResponse.json({
      ok: true,
      mode: "mailto",
      message:
        "Transmission received. Email delivery is still syncing, so we opened a ready-to-send draft for you instead.",
      mailtoUrl: buildMailtoUrl(payload),
    });
  }
}
