// features/auth/services/farcaster.client.ts
// Purpose: Frontend calls to your Farcaster auth endpoints

import { http } from '@lib/api-client';
import { API } from '@lib/endpoints';

type QuickRes = {
  jwt: string;
  userId: string;
  walletAddress?: `0x${string}`;
};

export async function farcasterQuickLogin(token: string): Promise<QuickRes> {
  // Backend: POST /auth/farcaster/quick  body: { token }
  return http.post<QuickRes>(API.auth.farcaster.quick, { token });
}

export async function farcasterVerify(token: string) {
  // Backend: POST /auth/farcaster/verify body: { token }
  return http.post(API.auth.farcaster.verify, { token });
}