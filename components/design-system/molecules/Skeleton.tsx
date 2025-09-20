"use client";
import cn from "clsx";
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cn("animate-pulse bg-white shadow-card", className)} />;
}