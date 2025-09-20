"use client";

import { HTMLAttributes } from "react";
import cn from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white p-5 shadow-card",
        className
      )}
      {...props}
    />
  );
}