import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { IconByName, getAccentClasses } from "@/lib/icon-map";
import type { ToolDefinition } from "@/lib/tools-registry";

interface ToolCardProps {
  tool: ToolDefinition;
  href?: string;
}

export function ToolCard({ tool, href = `/tool/${tool.id}` }: ToolCardProps) {
  const accent = getAccentClasses(tool.accent);

  return (
    <Link
      href={href}
      className="lv-surface lv-card-hover group flex h-full flex-col rounded-[28px] p-6"
    >
      <span
        role="img"
        aria-label={`Secure tool for ${tool.title} processing`}
        className={`flex size-16 items-center justify-center rounded-2xl ${accent.icon}`}
      >
        <IconByName
          iconName={tool.iconName}
          className="lv-neon-icon lv-icon-glow size-8 transition duration-200 group-hover:scale-105"
        />
        <span className="sr-only">{`Secure tool for ${tool.title} processing`}</span>
      </span>

      <h2 className="lv-text-primary mt-6 text-xl font-black">{tool.title}</h2>
      <p className="lv-text-secondary mt-3 text-sm leading-7">{tool.description}</p>
      <span className="lv-button-primary mt-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition">
        Open tool
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}
