import { http } from "@lib/api-client";
import { API } from "@lib/endpoints";

export type LeaderboardRow = {
  rank: number;
  userId: string;
  username?: string | null;
  walletAddress: `0x${string}`;
  fid?: string | null;
  points: number;          // weekly points OR all-time points based on endpoint
  avatarUrl?: string | null;
  country?: string | null;
};

export type LeaderboardPage = {
  items: LeaderboardRow[];
  nextCursor?: string | null;
};

export async function fetchWeeklyLeaderboard(cursor?: string, limit = 50): Promise<LeaderboardPage> {
  return http.get<LeaderboardPage>(API.leaderboard.weekly, { cursor, limit });
}

export async function fetchAllTimeLeaderboard(cursor?: string, limit = 50): Promise<LeaderboardPage> {
  return http.get<LeaderboardPage>(API.leaderboard.alltime, { cursor, limit });
}