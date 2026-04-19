"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "dark" | "light";
export type ThemeSource = "circadian" | "manual";
export const CIRCADIAN_LIGHT_START_HOUR = 7;
export const CIRCADIAN_DARK_START_HOUR = 19;

interface ThemeContextValue {
  theme: ThemeMode;
  source: ThemeSource;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveCircadianTheme(date = new Date()): ThemeMode {
  const hour = date.getHours();
  return hour >= CIRCADIAN_LIGHT_START_HOUR && hour < CIRCADIAN_DARK_START_HOUR
    ? "light"
    : "dark";
}

function resolveInitialTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const datasetTheme = document.documentElement.dataset.theme;

    if (datasetTheme === "light" || datasetTheme === "dark") {
      return datasetTheme;
    }
  }

  return resolveCircadianTheme();
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(resolveInitialTheme);
  const [source, setSource] = useState<ThemeSource>("circadian");
  const boundaryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (source !== "circadian") {
      return;
    }

    const syncTheme = () => {
      setThemeState(resolveCircadianTheme());
    };

    const scheduleNextBoundary = () => {
      const now = new Date();
      const nextBoundary = new Date(now);
      const hour = now.getHours();

      if (hour >= CIRCADIAN_LIGHT_START_HOUR && hour < CIRCADIAN_DARK_START_HOUR) {
        nextBoundary.setHours(CIRCADIAN_DARK_START_HOUR, 0, 0, 0);
      } else {
        nextBoundary.setDate(
          hour >= CIRCADIAN_DARK_START_HOUR ? now.getDate() + 1 : now.getDate()
        );
        nextBoundary.setHours(CIRCADIAN_LIGHT_START_HOUR, 0, 0, 0);
      }

      const delay = Math.max(60_000, nextBoundary.getTime() - now.getTime());
      boundaryTimerRef.current = window.setTimeout(() => {
        syncTheme();
        scheduleNextBoundary();
      }, delay);
    };

    syncTheme();
    scheduleNextBoundary();

    return () => {
      if (boundaryTimerRef.current) {
        window.clearTimeout(boundaryTimerRef.current);
        boundaryTimerRef.current = null;
      }
    };
  }, [source]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setSource("manual");
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      source,
      setTheme,
      toggleTheme,
    }),
    [setTheme, source, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
