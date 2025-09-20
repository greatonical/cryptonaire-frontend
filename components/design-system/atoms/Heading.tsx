"use client";

import { HTMLAttributes, ElementType } from "react";
import cn from "clsx";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: ElementType; // optional override
}

const SIZE = {
  1: "text-2xl",
  2: "text-xl",
  3: "text-lg",
  4: "text-base",
  5: "text-sm",
  6: "text-xs",
} as const;

type TagName = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export function Heading({ level = 1, as, className, ...props }: HeadingProps) {
  const tag = (`h${level}` as TagName);
  const Comp: ElementType = as ?? tag;
  return (
    <Comp className={cn("font-semibold text-ink-900", SIZE[level], className)} {...props} />
  );
}