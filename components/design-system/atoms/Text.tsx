// Text.tsx placeholder
"use client";

import { ElementType, HTMLAttributes } from "react";
import cn from "clsx";

type Tone = "default" | "muted" | "success" | "danger" | "warning";
type Size = "xs" | "sm" | "md" | "lg";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: Tone;
  size?: Size;
  weight?: "normal" | "medium" | "semibold";
}

const TONE: Record<Tone, string> = {
  default: "text-ink-900",
  muted: "text-ink-600",
  success: "text-green-600",
  danger: "text-red-600",
  warning: "text-yellow-600",
};

const SIZE: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Text({
  as: Comp = "p",
  tone = "default",
  size = "md",
  weight = "normal",
  className,
  ...props
}: TextProps) {
  return (
    <Comp
      className={cn(TONE[tone], SIZE[size], weight === "medium" && "font-medium", weight === "semibold" && "font-semibold", className)}
      {...props}
    />
  );
}