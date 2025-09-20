"use client";

import { useState } from "react";
import cn from "clsx";

export function Switch({
  checked,
  onChange,
  disabled,
}: {
  checked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState(!!checked);
  const val = checked ?? local;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        const next = !val;
        setLocal(next);
        onChange?.(next);
      }}
      className={cn(
        "relative h-7 w-12 rounded-full transition border",
        val ? "bg-brand/90 border-brand" : "bg-white border-line",
        "shadow-card"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white transition",
          val ? "left-6" : "left-0.5",
          "shadow-card"
        )}
      />
    </button>
  );
}