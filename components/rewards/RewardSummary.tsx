// components/rewards/RewardSummary.tsx
"use client";

import { Card } from "@components/design-system/molecules/Card";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Button } from "@components/design-system/atoms/Button";
import { Icon } from "@components/design-system/atoms/Icon";
import type { RewardSummary } from "@features/rewards/services/rewards.client";

function StatusChip({ status }: { status: RewardSummary["status"] }) {
  const map: Record<RewardSummary["status"], string> = {
    ineligible: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  const label: Record<RewardSummary["status"], string> = {
    ineligible: "Ineligible",
    pending: "Pending",
    processing: "Processing",
    paid: "Paid",
    failed: "Failed",
  };
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export function RewardSummaryCard({
  data,
  onViewLeaderboard,
  onViewTx,
}: {
  data: RewardSummary;
  onViewLeaderboard?: () => void;
  onViewTx?: (txHashOrId: string) => void;
}) {
  const range = `${new Date(data.weekStartISO).toLocaleDateString()} – ${new Date(data.weekEndISO).toLocaleDateString()}`;
  const refLabel =
    data.payoutRef?.type === "onchain" && data.payoutRef.txHash
      ? "View on explorer"
      : data.payoutRef?.type === "custodial" && data.payoutRef.payoutId
      ? "View payout"
      : null;
  const refValue =
    data.payoutRef?.type === "onchain" ? data.payoutRef.txHash :
    data.payoutRef?.type === "custodial" ? data.payoutRef.payoutId : undefined;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading level={2}>This week</Heading>
        <StatusChip status={data.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line p-3">
          <div className="text-xs text-ink-600">Pool</div>
          <div className="mt-1 text-[15px] font-semibold text-ink-900 flex items-center gap-2">
            <Icon name={data.poolToken === "USDC" ? "coin" : "wallet"} />
            {data.poolTotal} {data.poolToken}
          </div>
        </div>

        <div className="rounded-xl border border-line p-3">
          <div className="text-xs text-ink-600">Mode</div>
          <div className="mt-1 text-[15px] font-semibold text-ink-900 capitalize">
            {data.allocationMode}
          </div>
        </div>

        <div className="rounded-xl border border-line p-3">
          <div className="text-xs text-ink-600">Rank</div>
          <div className="mt-1 text-[15px] font-semibold text-ink-900">
            {data.rank ?? "—"}
          </div>
        </div>

        <div className="rounded-xl border border-line p-3">
          <div className="text-xs text-ink-600">Points</div>
          <div className="mt-1 text-[15px] font-semibold text-ink-900">
            {data.points ?? "—"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line p-3 bg-background/50">
        <div className="text-xs text-ink-600">Estimated reward</div>
        <div className="mt-1 text-[15px] font-semibold text-ink-900">
          {data.estimate ? `${data.estimate} ${data.poolToken}` : "—"}
        </div>
        <Text tone="muted" size="sm" className="mt-1">
          Window: {range}. Distribution runs Monday 00:05 UTC.
        </Text>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onViewLeaderboard}>
          Leaderboard
        </Button>
        {refLabel && refValue && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewTx?.(refValue)}
            leftIcon={<Icon name="external" />}
          >
            {refLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}