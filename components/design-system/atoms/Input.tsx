"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import cn from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-12 rounded-2xl border bg-white px-4 text-base outline-none transition shadow-card",
          invalid ? "border-red-500" : "border-line focus:border-brand",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";