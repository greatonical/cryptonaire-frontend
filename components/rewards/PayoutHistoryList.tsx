// components/rewards/PayoutHistoryList.tsx
"use client";

import { Card } from "@components/design-system/molecules/Card";
import { Text } from "@components/design-system/atoms/Text";
import { Icon } from "@components/design-system/atoms/Icon";
import type { PayoutHistoryItem } from "@features/rewards/services/rewards.client";

export function PayoutHistoryList({
  items,
  onOpenRef,
}: {
  items: PayoutHistoryItem[];
  onOpenRef?: (ref: { type: "onchain" | "custodial"; id: string }) => void;
}) {
  if (!items.length) {
    return (
      <Card>
        <Text tone="muted">No payouts yet.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((it, idx) => {
        const range = `${new Date(it.weekStartISO).toLocaleDateString()} – ${new Date(it.weekEndISO).toLocaleDateString()}`;
        const statusColor =
          it.status === "paid" ? "text-green-700" :
          it.status === "failed" ? "text-red-600" :
          it.status === "processing" ? "text-blue-700" :
          it.status === "pending" ? "text-yellow-700" : "text-ink-600";

        const ref =
          it.ref?.type === "onchain" && it.ref.txHash ? { type: "onchain" as const, id: it.ref.txHash } :
          it.ref?.type === "custodial" && it.ref.payoutId ? { type: "custodial" as const, id: it.ref.payoutId } :
          undefined;

        return (
          <Card key={idx} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand font-semibold">
                <Icon name={it.token === "USDC" ? "coin" : "wallet"} />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-ink-900">
                  {it.amount} {it.token}
                </div>
                <Text size="sm" tone="muted">{range}</Text>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${statusColor}`}>{it.status}</div>
              {ref && (
                <button
                  className="mt-1 inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
                  onClick={() => onOpenRef?.(ref)}
                >
                  <Icon name="external" size={16} />
                  Details
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}