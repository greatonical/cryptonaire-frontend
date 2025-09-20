"use client";

import cn from "clsx";
import { Icon } from "../atoms/Icon";

export function ListItem({
  title,
  subtitle,
  icon,
  onClick,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: Parameters<typeof Icon>[0]["name"];
  right?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border border-line bg-white p-4 shadow-card text-left",
        "flex items-center gap-3",
        className
      )}
    >
      {icon && <Icon name={icon} className="text-ink-900" />}
      <div className="flex-1">
        <div className="text-[15px] font-medium text-ink-900">{title}</div>
        {subtitle && <div className="text-sm text-ink-600">{subtitle}</div>}
      </div>
      {right ?? <Icon name="chevron-right" className="text-ink-600" />}
    </button>
  );
}