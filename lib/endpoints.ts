import { getPublicEnv } from "@lib/env";

const { NEXT_PUBLIC_API_BASE } = getPublicEnv();

export const API = {
  base: NEXT_PUBLIC_API_BASE.replace(/\/$/, ""),
  auth: {
    siweChallenge: "/auth/siwe/challenge",
    verify: "/auth/siwe/verify",
    me: "/auth/me",
  },
  game: {
    // start: "/game/session/start",
    // next: "/game/question/next",
    // submit: "/game/questions/submit",
    // summary: "/game/session/summary"
    start: "/game/session/start",
    status: "/game/status",
    next: "/game/question/next", // was /game/questions/next
    submit: "/game/attempt/submit",
    walkAway: "/game/session/walk-away",
    continue: "/game/session/continue",
    end: "/game/session/end",
  },
  leaderboard: {
    weekly: "/leaderboard/weekly",
    alltime: "/leaderboard/alltime",
  },
  profile: {
    me: "/me/profile",
    update: "/me/profile",
  },
  rewards: {
    summaryMe: "/rewards/summary/me",
    history: "/rewards/history",
    policy: "/rewards/policy",
  },
} as const;

export function url(path: string) {
  return `${API.base}${path}`;
}
