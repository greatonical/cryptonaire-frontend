"use client";

import { HTMLAttributes } from "react";
import cn from "clsx";

export function Screen({
  className,
  children,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("min-h-dvh bg-background pb-20", className)}>
      {children}
    </div>
  );
}