"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  startSession,
  getNextQuestion,
  submitAnswer,
  getSummary,
  type GameQuestion,
  type SummaryRes,
  type SubmitAnswerRes,
} from "../services/game.client";

type Status =
  | "idle"
  | "loading"
  | "question"
  | "submitting"
  | "summary"
  | "locked"
  | "error";

function setActiveSessionFlag(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem("cn_hasActiveSession", "1");
  else localStorage.removeItem("cn_hasActiveSession");
  window.dispatchEvent(
    new StorageEvent("storage", { key: "cn_hasActiveSession" })
  );
}

export function useGameSession() {
  const [status, setStatus] = useState<Status>("idle");
  const [session, setSession] = useState<{ sessionId: string } | null>(null);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastSubmit, setLastSubmit] = useState<SubmitAnswerRes | null>(null);
  const [summary, setSummary] = useState<SummaryRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (seconds: number) => {
      clearTimer();
      setTimeLeft(seconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearTimer();
            // auto-submit with no selection
            void handleSubmit(undefined, true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    },
    [clearTimer]
  );

  const loadNext = useCallback(async () => {
    setSelected(null);
    setLastSubmit(null);
    try {
      const q = await getNextQuestion();
      if (!q) {
        const s = await getSummary();
        setSummary(s);
        setStatus("summary");
        setActiveSessionFlag(false);
        return;
      }
      console.log("question", q);
      setQuestion(q);
      setStatus("question");
      startTimer(q.timeLimitSec ?? 30);
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Failed to load question");
    }
  }, [startTimer]);

  const begin = useCallback(async () => {
    try {
      setError(null);
      setSummary(null);
      setLastSubmit(null);
      setQuestion(null);
      setSelected(null);
      setStatus("loading");

      const s = await startSession();
      console.log("sees", s);
      if (s.locked) {
        setStatus("locked");
        setActiveSessionFlag(false);
        return;
      }
      setSession({ sessionId: s.sessionId });
      setActiveSessionFlag(true);
      await loadNext();
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Failed to start session");
    }
  }, [loadNext]);

  const handleSubmit = useCallback(
    async (optionId?: string, dueToTimeout = false) => {
      if (!question) return;
      setStatus("submitting");
      try {
        const res = await submitAnswer({
          questionId: question.id,
          optionId: optionId ?? "",
        });
        setLastSubmit(res);

        // If game complete → summary
        if (res.gameComplete) {
          const s = await getSummary();
          setSummary(s);
          setStatus("summary");
          setActiveSessionFlag(false);
          clearTimer();
          return;
        }

        // If correct, move on immediately
        if (res.correct) {
          await loadNext();
          return;
        }

        // Incorrect: stay here and let UI decide (walk away or continue with penalty)
        setStatus("question");
      } catch (e: any) {
        setStatus("error");
        setError(e?.message ?? "Failed to submit");
      }
    },
    [question, clearTimer, loadNext]
  );

  const continueWithPenalty = useCallback(async () => {
    // Back-end should apply the penalty on next submit or internally
    await loadNext();
  }, [loadNext]);

  const walkAway = useCallback(async () => {
    // End the session and show summary
    const s = await getSummary();
    setSummary(s);
    setStatus("summary");
    setActiveSessionFlag(false);
    clearTimer();
  }, [clearTimer]);

  const pickOption = useCallback((id: string) => setSelected(id), []);
  const isAnswered = useMemo(() => !!selected, [selected]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    status,
    session,
    question,
    timeLeft,
    selected,
    lastSubmit,
    summary,
    error,
    begin,
    pickOption,
    submit: handleSubmit,
    continueWithPenalty,
    walkAway,
    isAnswered,
  };
}
