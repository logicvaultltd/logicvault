"use client";

import { ChevronDown, ChevronRight, Braces, Brackets } from "lucide-react";
import { useState } from "react";

function formatPrimitive(value: unknown) {
  if (typeof value === "string") {
    return `"${value}"`;
  }

  if (value === null) {
    return "null";
  }

  return String(value);
}

function getPrimitiveClass(value: unknown) {
  if (value === null) {
    return "text-rose-400";
  }

  if (typeof value === "string") {
    return "text-emerald-400";
  }

  if (typeof value === "number") {
    return "text-sky-400";
  }

  if (typeof value === "boolean") {
    return "text-amber-400";
  }

  return "lv-text-secondary";
}

function isExpandable(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

function JsonTreeNode({
  label,
  value,
  depth = 0,
  defaultExpanded = false,
}: {
  label: string;
  value: unknown;
  depth?: number;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const expandable = isExpandable(value);
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : expandable
      ? Object.entries(value)
      : [];

  return (
    <div className="font-mono text-xs leading-6">
      <div
        className="flex items-start gap-2 rounded-xl px-2 py-1 transition hover:bg-white/5"
        style={{ paddingLeft: `${depth * 0.8 + 0.5}rem` }}
      >
        {expandable ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="mt-0.5 inline-flex size-5 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
          >
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : (
          <span className="mt-0.5 inline-flex size-5 items-center justify-center text-slate-500">
            •
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {label}
            </span>
            {expandable ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                  {Array.isArray(value) ? <Brackets className="size-3" /> : <Braces className="size-3" />}
                  {Array.isArray(value) ? `${value.length} items` : `${entries.length} keys`}
                </span>
                <span className="text-slate-500">
                  {Array.isArray(value) ? "[" : "{"}
                  {open ? "" : "..."}
                  {Array.isArray(value) ? "]" : "}"}
                </span>
              </>
            ) : (
              <span className={getPrimitiveClass(value)}>{formatPrimitive(value)}</span>
            )}
          </div>
        </div>
      </div>

      {expandable && open ? (
        <div className="mt-1 space-y-1">
          {entries.map(([entryLabel, entryValue], index) => (
            <JsonTreeNode
              key={`${label}-${entryLabel}-${index}`}
              label={entryLabel}
              value={entryValue}
              depth={depth + 1}
              defaultExpanded={depth < 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function JsonTreeView({
  value,
  rootLabel = "root",
}: {
  value: unknown;
  rootLabel?: string;
}) {
  return (
    <div className="lv-surface-inset rounded-[24px] px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          JSON Tree
        </span>
        <span className="lv-text-muted text-xs">
          Expand each branch to inspect nested fields.
        </span>
      </div>
      <JsonTreeNode label={rootLabel} value={value} defaultExpanded />
    </div>
  );
}
