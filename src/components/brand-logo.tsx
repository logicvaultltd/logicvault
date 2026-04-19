import Image from "next/image";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  size?: number;
  showWordmark?: boolean;
  priority?: boolean;
}

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  size = 40,
  showWordmark = true,
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/12 bg-white/6 shadow-[0_10px_18px_rgba(5,5,5,0.14)]",
          markClassName
        )}
        style={{ width: size, height: size, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" }}
      >
        <Image
          src="/extension/icons/icon128.png"
          alt="Logic Vault logo"
          width={size}
          height={size}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? undefined : "lazy"}
          className="shrink-0 object-contain"
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.04)_48%,rgba(255,255,255,0)_100%)]" />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "text-sm font-black tracking-[0.3em] uppercase",
            textClassName
          )}
        >
          Logic Vault
        </span>
      ) : null}
    </span>
  );
}
