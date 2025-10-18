// services/game.client.ts
import { http } from "@lib/api-client";
import { API } from "@lib/endpoints";

let lastAttemptToken: string | null = null;
let lastQuestionId: string | null = null;
let lastOptions: Array<{ id: string; text: string }> = [];

export type GameStage = "basic" | "mid" | "advanced";
export type GameQuestionOption = { id: string; text: string };
export type GameQuestion = {
  id: string;
  text: string;
  options: GameQuestionOption[];
  stage: GameStage;
  index: number;
  totalInStage: number;
  timeLimitSec: number;
};

export type StartSessionRes = {
  sessionId: string;
  currentStage?: GameStage;
  stageUnlocked?: number;
  totalStages?: number;
  locked?: boolean;
  lockedUntil?: string;
};

export type SubmitAnswerRes = {
  correct: boolean;
  correctOptionId: string;
  explanation?: string;
  stageComplete?: boolean;
  gameComplete?: boolean;
};

export type SummaryRes = {
  sessionId: string;
  totalPoints: number;
  correctCount: number;
  totalCount: number;
  stageReached: GameStage;
  leaderboardPosition?: number;
};

const toStage = (n: number | string | undefined): GameStage => {
  if (n === 1 || n === "mid") return "mid";
  if (n === 2 || n === "advanced" || n === "adv") return "advanced";
  return "basic";
};

const normalizeOptions = (raw: any[]): GameQuestionOption[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((o, idx) => {
    if (o && typeof o === "object") {
      const id = String((o as any).id ?? (o as any).value ?? (o as any).key ?? idx);
      const text = String(
        (o as any).text ??
          (o as any).label ??
          (o as any).name ??
          (o as any).value ??
          ""
      );
      return { id, text };
    }
    return { id: String(idx), text: String(o ?? "") };
  });
};

export async function startSession(): Promise<StartSessionRes> {
  return http.post<StartSessionRes>(API.game.start, {});
}

export async function getNextQuestion(): Promise<GameQuestion | null> {
  const res = await http.get<any>(API.game.next);
  if (!res || res.done) return null;

  lastAttemptToken = res.attemptToken ?? null;
  lastQuestionId = res.question?.id ?? null;

  const body = res.question?.body ?? {};
  const text = String(body?.text ?? body?.prompt ?? body?.question ?? "").trim();
  lastOptions = normalizeOptions(body?.options ?? []);

  return {
    id: res.question.id,
    text,
    options: lastOptions,
    stage: toStage(res.stage),
    index: res.question.index ?? 0,
    totalInStage: res.question.totalInStage ?? 0,
    timeLimitSec: res.ttlSeconds ?? 30,
  };
}

export async function submitAnswer(payload: {
  questionId: string;
  optionId: string; // '' allowed
}): Promise<SubmitAnswerRes> {
  if (!lastAttemptToken || !lastQuestionId) {
    throw new Error("No active question to submit");
  }
  const { questionId, optionId } = payload;
  if (questionId !== lastQuestionId) {
    throw new Error("Question mismatch");
  }

  let selectedIndex = 0;
  if (optionId) {
    const idx = lastOptions.findIndex((o) => o.id === optionId);
    if (idx < 0) throw new Error("Invalid option");
    selectedIndex = idx;
  }

  const dto = {
    attemptToken: lastAttemptToken,
    questionId,
    selectedIndex,   // 0..N-1
    optionId,        // '' allowed; BE transforms '' → undefined
  };

  const res = await http.post<SubmitAnswerRes>(API.game.submit, dto);
  lastAttemptToken = null;
  return res;
}

export async function getSummary(): Promise<SummaryRes> {
  return http.get<SummaryRes>(API.game.status);
}

// Anti-cheat: reset session points to zero
export async function resetPoints(): Promise<{ ok: true } | void> {
  return http.post(API.game.resetPoints, {});
}