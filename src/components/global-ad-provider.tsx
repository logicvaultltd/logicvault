"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SiteConfig } from "@/lib/config-provider";

const GlobalAdContext = createContext<SiteConfig | null>(null);

export function GlobalAdProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: SiteConfig;
}) {
  return <GlobalAdContext.Provider value={config}>{children}</GlobalAdContext.Provider>;
}

export function useGlobalSiteConfig() {
  const context = useContext(GlobalAdContext);

  if (!context) {
    throw new Error("useGlobalSiteConfig must be used inside GlobalAdProvider.");
  }

  return context;
}
