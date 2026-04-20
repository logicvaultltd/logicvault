import "server-only";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const ADMIN_COOKIE_NAME = "logic-vault-admin";
const DEFAULT_ADMIN_EMAIL = "ops@logicvault.org";

function toBase64(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function base64UrlEncode(value: string) {
  return toBase64(encoder.encode(value))
    .replace(/=/g, "");
}

function base64UrlDecode(value: string) {
  return decoder.decode(fromBase64(value));
}

function getJwtSecret() {
  return process.env.LEX_ADMIN_SECRET ?? process.env.LEX_ADMIN_PASSWORD ?? "";
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function digestValue(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function bytesEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

async function secureEqual(left: string, right: string) {
  const [leftDigest, rightDigest] = await Promise.all([digestValue(left), digestValue(right)]);
  return bytesEqual(leftDigest, rightDigest);
}

async function importSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getJwtSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importSigningKey(),
    encoder.encode(value)
  );

  return toBase64(new Uint8Array(signature))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export async function verifyAdminPassword(password: string) {
  const configured = process.env.LEX_ADMIN_PASSWORD;

  if (!configured) {
    return false;
  }

  return secureEqual(password, configured);
}

export function getConfiguredAdminEmail() {
  return process.env.LEX_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
}

export async function verifyAdminEmail(email: string) {
  return secureEqual(normalizeEmail(email), normalizeEmail(getConfiguredAdminEmail()));
}

export async function verifyAdminCredentials(email: string, password: string) {
  const [emailValid, passwordValid] = await Promise.all([
    verifyAdminEmail(email),
    verifyAdminPassword(password),
  ]);

  return emailValid && passwordValid;
}

export async function createAdminToken(email = getConfiguredAdminEmail()) {
  const secret = getJwtSecret();

  if (!secret) {
    throw new Error("Admin secret is not configured.");
  }

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      role: "admin",
      email: normalizeEmail(email),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    })
  );
  const signature = await signValue(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

export async function verifyAdminToken(token: string | undefined) {
  if (!getJwtSecret()) {
    return false;
  }

  if (!token) {
    return false;
  }

  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return false;
  }

  const signatureIsValid = await crypto.subtle.verify(
    "HMAC",
    await importSigningKey(),
    fromBase64(signature),
    encoder.encode(`${header}.${payload}`)
  );

  if (!signatureIsValid) {
    return false;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as {
      exp?: number;
      role?: string;
      email?: string;
    };

    return (
      parsed.role === "admin" &&
      typeof parsed.exp === "number" &&
      parsed.exp > Date.now() / 1000 &&
      normalizeEmail(parsed.email ?? "") === normalizeEmail(getConfiguredAdminEmail())
    );
  } catch {
    return false;
  }
}
