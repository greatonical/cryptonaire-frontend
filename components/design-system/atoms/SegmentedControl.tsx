"use client";

import cn from "clsx";

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-white p-1 shadow-card w-full">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-2 text-sm rounded-lg w-[50%]",
              active ? "bg-brand text-white" : "text-ink-900 hover:bg-black/5"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}