"use client";

import { InputHTMLAttributes } from "react";

export function Radio(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="radio" className="h-4 w-4 border-line text-brand focus:ring-0" {...props} />
      {props.children && <span className="text-sm text-ink-900">{props.children}</span>}
    </label>
  );
}