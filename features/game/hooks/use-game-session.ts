"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  startSession,
  getNextQuestion,
  submitAnswer,
  getSummary,
  resetPoints as resetPointsApi,
  type GameQuestion,
  type SummaryRes,
  type SubmitAnswerRes,
} from "../services/game.client";
import { useSessionStore } from "@lib/store/session.store";

type Status = "idle" | "loading" | "question" | "submitting" | "summary" | "locked" | "error";

export function useGameSession() {
  const [status, setStatus] = useState<Status>("idle");
  const [session, setSession] = useState<{ sessionId: string } | null>(null);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastSubmit, setLastSubmit] = useState<SubmitAnswerRes | null>(null);
  const [summary, setSummary] = useState<SummaryRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  // session store actions
  const markSessionActive = useSessionStore((s) => s.markSessionActive);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const loadNext = useCallback(async () => {
    setSelected(null);
    setLastSubmit(null);
    try {
      const q = await getNextQuestion();
      if (!q) {
        const s = await getSummary();
        setSummary(s);
        setStatus("summary");
        markSessionActive(false); // also stamps lastSessionAt
        return;
      }
      setQuestion(q);
      setStatus("question");
      startTimer(q.timeLimitSec ?? 30);
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Failed to load question");
    }
  }, [markSessionActive]);

  const startTimer = useCallback((seconds: number) => {
    clearTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // ⏲️ On timeout, auto-advance to next question (no submit -> no 400)
          void loadNext();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer, loadNext]);

  const begin = useCallback(async () => {
    try {
      setError(null);
      setSummary(null);
      setLastSubmit(null);
      setQuestion(null);
      setSelected(null);
      setStatus("loading");

      const s = await startSession();
      if ((s as any).locked) {
        setStatus("locked");
        markSessionActive(false);
        return;
      }
      setSession({ sessionId: s.sessionId });
      markSessionActive(true);
      await loadNext();
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Failed to start session");
    }
  }, [loadNext, markSessionActive]);

  const handleSubmit = useCallback(
    async (optionId?: string) => {
      if (!question) return;
      setStatus("submitting");
      try {
        const res = await submitAnswer({ questionId: question.id, optionId: optionId ?? "" });
        setLastSubmit(res);

        if ((res as any).gameComplete) {
          const s = await getSummary();
          setSummary(s);
          setStatus("summary");
          markSessionActive(false);
          clearTimer();
          return;
        }

        if (res.correct) {
          await loadNext();
          return;
        }

        // Incorrect: stay; UI offers walk away / continue
        setStatus("question");
      } catch (e: any) {
        setStatus("error");
        setError(e?.message ?? "Failed to submit");
      }
    },
    [question, clearTimer, loadNext, markSessionActive]
  );

  // Accept an optional reason (e.g., "stepdown") — backend call unchanged
  const continueWithPenalty = useCallback(async (_reason?: string) => {
    await loadNext();
  }, [loadNext]);

  const walkAway = useCallback(async () => {
    const s = await getSummary();
    setSummary(s);
    setStatus("summary");
    markSessionActive(false);
    clearTimer();
  }, [clearTimer, markSessionActive]);

  // 🕵🏼 Anti-cheat: reset points if user blurs or hides tab
  const handleBlurOrHide = useCallback(async () => {
    if (status === "question" || status === "submitting") {
      try { await resetPointsApi(); } catch {}
    }
  }, [status]);

  useEffect(() => {
    const onBlur = () => void handleBlurOrHide();
    const onVis = () => { if (document.visibilityState === "hidden") void handleBlurOrHide(); };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [handleBlurOrHide]);

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