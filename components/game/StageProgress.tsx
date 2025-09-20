"use client";

import { ProgressBar } from "@components/design-system/molecules/ProgressBar";
import { Text } from "@components/design-system/atoms/Text";

export default function StageProgress({
  stageLabel,
  index,
  total,
  timeLeft,
  timeTotal,
}: {
  stageLabel: string;
  index: number;
  total: number;
  timeLeft: number;
  timeTotal: number;
}) {
  const pct = ((timeTotal - timeLeft) / timeTotal) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Text weight="medium">{stageLabel}</Text>
        <Text tone="muted">Q{index}/{total} · {timeLeft}s</Text>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}