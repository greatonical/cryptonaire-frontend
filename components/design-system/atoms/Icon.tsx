// components/design-system/atoms/Icon.tsx
"use client";

import cn from "clsx";
import { Image } from "./Image";
import { twMerge } from "tailwind-merge";

type IconName =
  | "home"
  | "game"
  | "trophy"
  | "user"
  | "chevron-right"
  | "settings"
  | "wallet"
  | "x"
  | "coin"
  | "external";

export function Icon({
  name,
  size = 22,
  className,
  strokeWidth = 1.6,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cn("text-ink-900", className),
  };
  switch (name) {
    // ... keep existing cases (home, game, trophy, user, chevron-right, settings, wallet, x)
    case "coin":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7 12h10M12 7v10" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M18 3h3v3" />
          <path d="M11 13l10-10" />
          <path d="M21 10v11H3V3h11" />
        </svg>
      );
    default:
      // fallback to wallet as safe default
      return (
        <svg {...common}>
          <path d="M3 7h18v10H3z" />
          <path d="M16 12h2" />
          <path d="M3 7V6a2 2 0 0 1 2-2h11" />
        </svg>
      );
  }
}

export const CryptonaireIcon: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className, ...props }) => {
  return <Image className={twMerge("w-7 h-7", className)} src={"/icon.png"} />;
};
