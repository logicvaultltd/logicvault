import type { SiteConfig } from "@/lib/config-provider";
import type { ToolProvider } from "@/lib/tools-registry";

export function isProviderAvailable(
  provider: ToolProvider,
  apiStatus: SiteConfig["apiStatus"]
) {
  void provider;
  void apiStatus;

  // The current engine can complete every public tool with a local or built-in fallback,
  // so provider tags act as enhancement hints instead of hard availability gates.
  return true;
}

export function getProviderMaintenanceMessage(provider: ToolProvider) {
  if (provider === "gemini") {
    return "The Vault encountered a secure hiccup. Please try again.";
  }

  if (provider === "cloudconvert") {
    return "The Vault encountered a secure hiccup. Please try again.";
  }

  return "The Vault encountered a secure hiccup. Please try again.";
}
