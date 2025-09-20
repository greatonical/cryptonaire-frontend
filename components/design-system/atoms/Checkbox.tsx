"use client";

import { InputHTMLAttributes } from "react";

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" className="h-4 w-4 rounded border-line text-brand focus:ring-0" {...props} />
      {props.children && <span className="text-sm text-ink-900">{props.children}</span>}
    </label>
  );
}