"use client";

import { Screen } from "@components/design-system/layout/Screen";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Button } from "@components/design-system/atoms/Button";
import { Card } from "@components/design-system/molecules/Card";
import { Skeleton } from "@components/design-system/molecules/Skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMyRewardsSummary } from "@features/rewards/hooks/use-rewards";

function hasActiveGameSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cn_hasActiveSession") === "1";
}

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const { data: summary, isLoading: sLoading, isError: sErr } = useMyRewardsSummary();

  useEffect(() => {
    setActive(hasActiveGameSession());
    const onStorage = () => setActive(hasActiveGameSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <Screen>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <div className="flex items-end justify-between">
          <div>
            <Heading level={1}>Welcome back</Heading>
            <Text tone="muted" size="sm">Play up to 1 hour per day</Text>
          </div>
        </div>

        {/* Session CTA */}
        <Card className="space-y-3">
          <div className="text-[15px] font-semibold text-ink-900">
            {active ? "Resume your session" : "Start today’s session"}
          </div>
          <Button
            onClick={() => router.push("/game")}
            size="lg"
            block
          >
            {active ? "Resume" : "Start now"}
          </Button>
          <Text size="sm" tone="muted">
            Stages: Basic → Mid (DeFi) → Advanced (Protocols). 30s per question.
          </Text>
        </Card>

        {/* Rewards estimate */}
        <div className="space-y-2">
          <Heading level={3}>This week</Heading>
          {sLoading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : sErr || !summary ? (
            <Card><Text tone="muted">Rewards summary unavailable.</Text></Card>
          ) : (
            <Card className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line p-3">
                <div className="text-xs text-ink-600">Your rank</div>
                <div className="mt-1 text-[15px] font-semibold text-ink-900">{summary.rank ?? "—"}</div>
              </div>
              <div className="rounded-xl border border-line p-3">
                <div className="text-xs text-ink-600">Points</div>
                <div className="mt-1 text-[15px] font-semibold text-ink-900">{summary.points ?? "—"}</div>
              </div>
              <div className="rounded-xl border border-line p-3 col-span-2">
                <div className="text-xs text-ink-600">Estimated reward</div>
                <div className="mt-1 text-[15px] font-semibold text-ink-900">
                  {summary.estimate ? `${summary.estimate} ${summary.poolToken}` : "—"}
                </div>
                <Text size="sm" tone="muted" className="mt-1">
                  Distribution runs Monday 00:05 UTC.
                </Text>
              </div>
              <Button variant="outline" className="col-span-2" onClick={() => router.push("/leaderboard")}>
                View leaderboard
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Screen>
  );
}