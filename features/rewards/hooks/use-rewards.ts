// features/rewards/hooks/use-rewards.ts
"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchMyRewardsSummary,
  fetchMyPayoutHistory,
  type RewardSummary,
  type PayoutHistoryPage,
} from "../services/rewards.client";
import { http } from "@lib/api-client";
import { API } from "@lib/endpoints";

// Shape returned by /leaderboard/me (we only need weekly)
type RankBlock = { rank: number | null; score: number; weekId?: number };
type LeaderboardMe =
  | { weekly: RankBlock | null; allTime?: RankBlock | null; alltime?: RankBlock | null }
  | { weekly?: RankBlock | null; allTime?: RankBlock | null; alltime?: RankBlock | null };

export function useMyRewardsSummary() {
  return useQuery<RewardSummary, Error>({
    queryKey: ["rewards", "summary", "me", "merged"],
    staleTime: 30_000,
    queryFn: async () => {
      // Fetch both in parallel
      const [baseSummary, me] = await Promise.all([
        fetchMyRewardsSummary(),
        http.get<LeaderboardMe>(API.leaderboard.me),
      ]);

      // Prefer weekly block (ignore allTime/alltime for this card)
      const weekly: RankBlock | undefined | null = (me as any)?.weekly ?? null;

      // Merge into the shape your Home card already expects:
      // rank, points (from leaderboard/me) + estimate, poolToken (from rewards)
      return {
        ...baseSummary,
        rank: weekly?.rank ?? null,
        points: weekly?.score ?? 0,
      } as RewardSummary;
    },
  });
}

export function useMyPayoutHistory() {
  return useInfiniteQuery<PayoutHistoryPage, Error>({
    queryKey: ["rewards", "history", "me"],
    queryFn: ({ pageParam }) =>
      fetchMyPayoutHistory(pageParam as string | undefined, 20),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}