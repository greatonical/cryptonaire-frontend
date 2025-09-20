// app/(tabs)/profile/rewards/page.tsx
"use client";

import { Screen } from "@components/design-system/layout/Screen";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Button } from "@components/design-system/atoms/Button";
import { RewardSummaryCard } from "@components/rewards/RewardSummary";
import { PayoutHistoryList } from "@components/rewards/PayoutHistoryList";
import { useMyRewardsSummary, useMyPayoutHistory } from "@features/rewards/hooks/use-rewards";
import { Protected } from "@components/guards/Protected";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useMemo } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit"; // read-only UX/context

export default function RewardsPage() {
  return (
    <Protected>
      <RewardsInner />
    </Protected>
  );
}

function RewardsInner() {
  const router = useRouter();
  const { data: summary, isLoading: summaryLoading, isError: summaryErr, error: summaryErrObj } = useMyRewardsSummary();
  const {
    data: historyPages,
    isLoading: historyLoading,
    isError: historyErr,
    error: historyErrObj,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMyPayoutHistory();

  // MiniKit context (optional UI touch, never for auth)
  let fid: string | undefined = undefined;
  try {
    const { context } = useMiniKit();
    fid = context?.user?.fid ? String(context.user.fid) : undefined;
  } catch {
    // library not present or not in Mini App; ignore
  }

  const historyItems = useMemo(
    () => historyPages?.pages.flatMap((p) => p.items) ?? [],
    [historyPages]
  );

  function openRef(ref: { type: "onchain" | "custodial"; id: string }) {
    try {
      if (ref.type === "onchain") {
        // Base explorer deep link (user can change if your backend returns network)
        window.open(`https://basescan.org/tx/${ref.id}`, "_blank", "noopener,noreferrer");
      } else {
        // Custodial (Circle) — you might have a dashboard link pattern; for now, copy ID
        navigator.clipboard.writeText(ref.id);
        toast.success("Payout ID copied to clipboard");
      }
    } catch {
      /* noop */
    }
  }

  return (
    <Screen>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <div className="flex items-end justify-between">
          <div>
            <Heading level={1}>Rewards</Heading>
            {fid && <Text tone="muted" size="sm">f/{fid}</Text>}
          </div>
          <Button variant="outline" onClick={() => router.push("/leaderboard")}>Leaderboard</Button>
        </div>

        {summaryLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-white shadow-card" />
        ) : summaryErr ? (
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <Text tone="danger">Failed to load summary: {summaryErrObj?.message}</Text>
          </div>
        ) : summary ? (
          <RewardSummaryCard
            data={summary}
            onViewLeaderboard={() => router.push("/leaderboard")}
            onViewTx={(id) => openRef({ type: summary.payoutRef?.type === "onchain" ? "onchain" : "custodial", id })}
          />
        ) : null}

        <div className="mt-2">
          <Heading level={3} className="mb-2">History</Heading>

          {historyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white shadow-card" />
              ))}
            </div>
          ) : historyErr ? (
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <Text tone="danger">Failed to load history: {historyErrObj?.message}</Text>
            </div>
          ) : (
            <>
              <PayoutHistoryList items={historyItems} onOpenRef={openRef} />
              {hasNextPage && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  block
                >
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Screen>
  );
}