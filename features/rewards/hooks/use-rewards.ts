// features/rewards/hooks/use-rewards.ts
"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchMyRewardsSummary,
  fetchMyPayoutHistory,
  type RewardSummary,
  type PayoutHistoryPage,
} from "../services/rewards.client";

export function useMyRewardsSummary() {
  return useQuery<RewardSummary, Error>({
    queryKey: ["rewards", "summary", "me"],
    queryFn: fetchMyRewardsSummary,
    staleTime: 30_000,
  });
}

export function useMyPayoutHistory() {
  return useInfiniteQuery<PayoutHistoryPage, Error>({
    queryKey: ["rewards", "history", "me"],
    queryFn: ({ pageParam }) => fetchMyPayoutHistory(pageParam as string | undefined, 20),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}