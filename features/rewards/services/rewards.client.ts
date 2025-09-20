// features/rewards/services/rewards.client.ts
import { http } from "@lib/api-client";
import { API } from "@lib/endpoints";

export type RewardStatus = "ineligible" | "pending" | "processing" | "paid" | "failed";
export type RewardToken = "USDC" | "ETH";
export type AllocationMode = "equal" | "weighted";

export type RewardSummary = {
  weekStartISO: string;         // e.g., "2025-09-08"
  weekEndISO: string;           // e.g., "2025-09-15" (exclusive)
  poolToken: RewardToken;
  poolTotal: string;            // human string "1000" (frontend formats)
  allocationMode: AllocationMode;
  rank?: number | null;
  points?: number | null;
  estimate?: string | null;     // estimated payout for this user (human string)
  status: RewardStatus;
  payoutRef?: {
    type: "onchain" | "custodial";
    txHash?: string;
    payoutId?: string;          // Circle payout id
  } | null;
};

export type PayoutHistoryItem = {
  weekStartISO: string;
  weekEndISO: string;
  token: RewardToken;
  amount: string;               // human string
  status: RewardStatus;
  ref?: {
    type: "onchain" | "custodial";
    txHash?: string;
    payoutId?: string;
  } | null;
  createdAt: string;            // ISO
};

export type PayoutHistoryPage = {
  items: PayoutHistoryItem[];
  nextCursor?: string | null;
};

export async function fetchMyRewardsSummary(): Promise<RewardSummary> {
  return http.get<RewardSummary>(API.rewards.summaryMe);
}

export async function fetchMyPayoutHistory(cursor?: string, limit = 20): Promise<PayoutHistoryPage> {
  return http.get<PayoutHistoryPage>(API.rewards.history, { cursor, limit });
}

export type RewardsPolicy = {
  scheduleCron: string;           // "5 0 * * 1"
  topN: number;                   // e.g., 10
  token: RewardToken;             // default token
  notes?: string;
};

export async function fetchRewardsPolicy(): Promise<RewardsPolicy> {
  return http.get<RewardsPolicy>(API.rewards.policy);
}