"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import cn from "clsx";

type Variant = "primary" | "outline" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed",
  outline:
    "border border-line bg-white hover:bg-black/5 hover:border-brand disabled:opacity-60 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent hover:bg-black/5 disabled:opacity-60 disabled:cursor-not-allowed",
  soft:
    "bg-brand/10 text-brand-700 hover:bg-brand/15 disabled:opacity-60 disabled:cursor-not-allowed",
  danger:
    "bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-[15px] rounded-xl",
  lg: "h-12 px-5 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", block, leftIcon, rightIcon, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition shadow-card cursor-pointer",
          VARIANT[variant],
          SIZE[size],
          block && "w-full",
          className,
        )}
        {...props}
      >
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";