"use client";

import { useEffect, useState } from "react";
import { http } from "@lib/api-client";
import { API } from "@lib/endpoints";

type RankBlock = { rank: number | null; score: number; weekId?: number };

type MyRankRes =
  | { weekly: RankBlock | null; allTime: RankBlock | null }
  | { weekly: RankBlock | null; alltime: RankBlock | null }
  | { weekly?: RankBlock | null; allTime?: RankBlock | null; alltime?: RankBlock | null };

type RewardsSummary = {
  totalEarned?: number;
  pending?: number;
  nextPayoutAt?: string;
};

export function useHomeStats() {
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<{ weekly: RankBlock; alltime: RankBlock } | null>(null);
  const [rewards, setRewards] = useState<RewardsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [me, rew] = await Promise.all([
          http.get<MyRankRes>(API.leaderboard.me),
          http.get<RewardsSummary>(API.rewards.summaryMe),
        ]);
        if (!mounted) return;

        const weekly = (me.weekly ?? { rank: null, score: 0 }) as RankBlock;
        const alltime = ((me as any).alltime ?? (me as any).allTime ?? { rank: null, score: 0 }) as RankBlock;

        setRank({ weekly, alltime });
        setRewards(rew ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load stats");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { loading, rank, rewards, error };
}