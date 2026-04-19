"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface RecentTool {
  id: string;
  viewedAt: string;
}

interface VaultContextValue {
  rememberTool: (id: string) => void;
}

const VaultContext = createContext<VaultContextValue | null>(null);
const RECENTS_STORAGE_KEY = "logic-vault:recent-tools";

function getStoredRecentTools() {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(RECENTS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return (JSON.parse(stored) as RecentTool[]).slice(0, 3);
  } catch {
    window.localStorage.removeItem(RECENTS_STORAGE_KEY);
    return [];
  }
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(getStoredRecentTools);

  useEffect(() => {
    window.localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(recentTools));
  }, [recentTools]);

  const rememberTool = useCallback((id: string) => {
    setRecentTools((current) => {
      if (current[0]?.id === id) {
        return current;
      }

      const next = [
        { id, viewedAt: new Date().toISOString() },
        ...current.filter((item) => item.id !== id),
      ];

      return next.slice(0, 3);
    });
  }, []);

  const value = useMemo(
    () => ({
      rememberTool,
    }),
    [rememberTool]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVaultContext() {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVaultContext must be used inside VaultProvider.");
  }

  return context;
}
