import type { Ref } from "react";

import type { ToolInput } from "@/lib/tools-registry";

interface VaultInputProps {
  input: ToolInput;
  value: string;
  onChange: (name: string, value: string) => void;
  inputRef?: Ref<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
}

const baseClassName =
  "lv-input-base w-full rounded-2xl px-4 py-3 text-sm outline-none transition";

export function VaultInput({
  input,
  value,
  onChange,
  inputRef,
}: VaultInputProps) {
  return (
    <label className="space-y-2">
      <span className="lv-text-secondary block text-sm font-semibold">{input.label}</span>

      {input.type === "select" ? (
        <select
          ref={inputRef as Ref<HTMLSelectElement>}
          value={value}
          onChange={(event) => onChange(input.name, event.target.value)}
          className={baseClassName}
        >
          <option value="">Choose an option</option>
          {input.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : input.type === "textarea" ? (
        <textarea
          ref={inputRef as Ref<HTMLTextAreaElement>}
          value={value}
          placeholder={input.placeholder}
          onChange={(event) => onChange(input.name, event.target.value)}
          className={`${baseClassName} min-h-28 resize-y`}
        />
      ) : (
        <input
          ref={inputRef as Ref<HTMLInputElement>}
          type={input.type}
          value={value}
          min={input.min}
          step={input.step}
          placeholder={input.placeholder}
          onChange={(event) => onChange(input.name, event.target.value)}
          className={baseClassName}
        />
      )}

      {input.helpText ? (
        <span className="lv-text-muted block text-xs leading-6">{input.helpText}</span>
      ) : null}
    </label>
  );
}
