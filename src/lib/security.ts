const encoder = new TextEncoder();

export const CONTACT_SESSION_COOKIE_NAME = "lv_contact_session";
export const CONTACT_RATE_LIMIT_MAX = 3;
export const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export interface MathCaptchaChallenge {
  left: number;
  right: number;
  token: string;
}

interface VerifyMathCaptchaInput extends MathCaptchaChallenge {
  answer: number | string;
  sessionId: string;
}

function getSecuritySecret() {
  return (
    process.env.CONTACT_SECURITY_SECRET ??
    process.env.LEX_ADMIN_PASSWORD ??
    "logicvault-contact-security"
  );
}

function toBase64Url(buffer: ArrayBuffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecuritySecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(signature);
}

function randomInteger(min: number, max: number) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return min + (values[0] % (max - min + 1));
}

function stripScriptsAndTags(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, " ");
}

export function createSecuritySessionId() {
  return crypto.randomUUID();
}

export async function createMathCaptcha(sessionId: string): Promise<MathCaptchaChallenge> {
  const left = randomInteger(1, 20);
  const right = randomInteger(1, 20);
  const token = await signValue(`${sessionId}:${left}:${right}`);

  return {
    left,
    right,
    token,
  };
}

export async function verifyMathCaptcha({
  left,
  right,
  answer,
  token,
  sessionId,
}: VerifyMathCaptchaInput) {
  const parsedLeft = Number(left);
  const parsedRight = Number(right);
  const parsedAnswer = Number(answer);

  if (
    !Number.isInteger(parsedLeft) ||
    !Number.isInteger(parsedRight) ||
    !Number.isInteger(parsedAnswer)
  ) {
    return false;
  }

  if (parsedAnswer !== parsedLeft + parsedRight) {
    return false;
  }

  const expectedToken = await signValue(`${sessionId}:${parsedLeft}:${parsedRight}`);
  return token === expectedToken;
}

export const MathCaptcha = {
  create: createMathCaptcha,
  verify: verifyMathCaptcha,
};

export function sanitizeContactText(
  value: string | undefined,
  maxLength: number,
  options?: { preserveNewlines?: boolean }
) {
  const stripped = stripScriptsAndTags(value ?? "");

  if (options?.preserveNewlines) {
    return stripped
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  return stripped.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function readCookieValue(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${cookieName}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    ""
  );
}

export async function hashValue(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
