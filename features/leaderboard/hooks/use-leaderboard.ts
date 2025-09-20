"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchWeeklyLeaderboard,
  fetchAllTimeLeaderboard,
  type LeaderboardPage,
  type LeaderboardRow,
} from "../services/leaderboard.client";

export type BoardKind = "weekly" | "alltime";

const PAGE_SIZE = 50;

export function useLeaderboard(kind: BoardKind) {
  const query = useInfiniteQuery<LeaderboardPage, Error>({
    queryKey: ["leaderboard", kind],
    queryFn: ({ pageParam }) =>
      kind === "weekly"
        ? fetchWeeklyLeaderboard(pageParam as string | undefined, PAGE_SIZE)
        : fetchAllTimeLeaderboard(pageParam as string | undefined, PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
  });


  const items: LeaderboardRow[] =
    query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    ...query,
    items,
    loadMore: () => query.fetchNextPage(),
    hasMore: query.hasNextPage,
  };
}