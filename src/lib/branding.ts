export function generateBrandedFilename(originalName: string) {
  const trimmed = originalName.trim() || "logic-vault-file";
  const extensionMatch = trimmed.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch?.[1] ?? "";
  const stem = trimmed.replace(/\.[^.]+$/, "");
  const cleanStem =
    stem
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "logic-vault-file";

  return `logicvault.org_${cleanStem}${extension.toLowerCase()}`;
}

export function buildContentDisposition(filename: string) {
  return `attachment; filename="${generateBrandedFilename(filename)}"`;
}
