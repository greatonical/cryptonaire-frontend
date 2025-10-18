"use client";

import { useEffect, useState } from "react";
import { Screen } from "@components/design-system/layout/Screen";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Button } from "@components/design-system/atoms/Button";
import { Card } from "@components/design-system/molecules/Card";
import { SegmentedControl } from "@components/design-system/atoms/SegmentedControl";
import { LeaderboardList } from "@components/leaderboard/LeaderboardList";
import {
  useLeaderboard,
  type BoardKind,
} from "@features/leaderboard/hooks/use-leaderboard";
import { useSessionStore } from "@lib/store/session.store";
import Lottie from "lottie-react";
import BackgroundAnimation from "@assets/animations/winner.json";

export default function LeaderboardPage() {
  const [kind, setKind] = useState<BoardKind>("weekly");
  const {
    items,
    isLoading,
    isError,
    error,
    hasMore,
    loadMore,
    isFetchingNextPage,
  } = useLeaderboard(kind);
  //   const userId = useSessionStore((s) => s.userId); // optional: highlight current user
  const highlightAddress = useSessionStore((s) => s.address) ?? undefined;

  useEffect(()=>{
    console.log("items",items)
  },[items])
  return (
    <Screen>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <div className="flex flex-col items-start justify-between">
          <div className="mb-4">
            <Heading level={1}>Leaderboard</Heading>
            <Text tone="muted" size="sm">
              {kind === "weekly"
                ? "Weekly standings reset every Monday"
                : "All-time top performers"}
            </Text>
          </div>
          <SegmentedControl
            options={[
              { label: "Weekly", value: "weekly" as const },
              { label: "All-time", value: "alltime" as const },
            ]}
            value={kind}
            onChange={setKind}
          />
        </div>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl bg-white shadow-card"
              />
            ))}
          </div>
        )}

        {isError && (
          <Card>
            <Text tone="danger">
              Failed to load leaderboard: {error?.message}
            </Text>
          </Card>
        )}

        {!isLoading && !isError && (
          <>
            {items.length > 0 ? (
              <LeaderboardList
                rows={items}
                highlightAddress={highlightAddress}
              />
            ) : (
              <div className="flex flex-col">
                <Lottie
                  className=""
                  animationData={BackgroundAnimation}
                  loop={true}
                />

                <p className="font-black text-xl text-center text-brand-primary mt-[-50px]">
                  You are doing well, champ!
                </p>
                <p className="font-medium text-center">
                  But there is nothing to see here
                </p>
              </div>
            )}

            {hasMore && (
              <Button
                onClick={() => loadMore()}
                disabled={isFetchingNextPage}
                variant="outline"
                block
                className="mt-2"
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
