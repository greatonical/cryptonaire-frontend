"use client";

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}