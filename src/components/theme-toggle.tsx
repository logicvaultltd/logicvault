"use client";

import { MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  compact?: boolean;
  onToggle?: () => void;
}

export function ThemeToggle({ compact = false, onToggle }: ThemeToggleProps) {
  const { source, theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => {
        toggleTheme();
        onToggle?.();
      }}
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
      aria-pressed={theme === "light"}
      className={cn(
        "lv-header-control inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition",
        compact ? "w-full justify-center" : ""
      )}
    >
      <span className="inline-flex size-5 items-center justify-center">
        {theme === "light" ? <MoonStar className="size-4" /> : <SunMedium className="size-4" />}
      </span>
      <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
      {!compact ? (
        <span className="hidden rounded-full border border-current/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] opacity-80 lg:inline-flex">
          {source === "circadian" ? "Auto" : nextThemeLabel}
        </span>
      ) : null}
    </button>
  );
}
