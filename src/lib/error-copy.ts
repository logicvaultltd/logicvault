export const VAULT_SECURE_HICCUP =
  "The Vault encountered a secure hiccup. Please try again.";

const TECHNICAL_ERROR_PATTERN =
  /(cannot find module|pdf\.worker|stack trace|typeerror|referenceerror|syntaxerror|unexpected token|enoent|eacces|worker failed|networkerror)/i;

export function toVaultErrorMessage(
  value: unknown,
  fallback = VAULT_SECURE_HICCUP
) {
  const message = value instanceof Error ? value.message : String(value ?? "");
  const cleanMessage = message.replace(/^Error:\s*/i, "").trim();

  if (!cleanMessage || cleanMessage.length > 180 || TECHNICAL_ERROR_PATTERN.test(cleanMessage)) {
    return fallback;
  }

  return cleanMessage;
}
