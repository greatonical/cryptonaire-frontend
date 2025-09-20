"use client";

import { Protected } from "@components/guards/Protected";
import StageProgress from "@components/game/StageProgress";
import QuestionCard from "@components/game/QuestionCard";
import { useGameSession } from "@features/game/hooks/use-game-session";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Screen } from "@components/design-system/layout/Screen";
import { Card } from "@components/design-system/molecules/Card";
import { Button } from "@components/design-system/atoms/Button";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Modal } from "@components/design-system/molecules/Modal";

const STAGE_LABELS: Record<string, string> = {
  basic: "Basic",
  mid: "Intermediate (DeFi)",
  advanced: "Advanced (Protocols)",
};

export default function GamePage() {
  return (
    <Protected>
      <GameInner />
    </Protected>
  );
}

function GameInner() {
  const {
    status,
    question,
    timeLeft,
    selected,
    lastSubmit,
    summary,
    error,
    begin,
    pickOption,
    submit,
    continueWithPenalty,
    walkAway,
    isAnswered,
  } = useGameSession();

  const [showPenalty, setShowPenalty] = useState(false);

  useEffect(() => {
    if (status === "idle") begin();
  }, [status, begin]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Open penalty modal when last submit was incorrect
  useEffect(() => {
    if (status === "question" && lastSubmit && !lastSubmit.correct) {
      setShowPenalty(true);
    } else {
      setShowPenalty(false);
    }
  }, [status, lastSubmit]);

  const submitting = status === "submitting";

  // --- NEW: Normalize question shape safely (handles question.body.*) ---
  const qText = useMemo(() => {
    // prefer top-level .text; fallback to body.text; fallback to empty
    // @ts-expect-error – body may not exist on the typed shape
    return question?.text ?? question?.body?.text ?? "";
  }, [question]);

  const qOptions = useMemo(() => {
    // prefer top-level .options; fallback to body.options; always return an array
    // @ts-expect-error – body may not exist on the typed shape
    const opts = question?.options ?? question?.body?.options;
    return Array.isArray(opts) ? opts : [];
  }, [question]);

  const stageLabel = useMemo(() => {
    // stage might be number in some responses; keep fallback
    const key = (question?.stage as string) ?? "basic";
    return STAGE_LABELS[key] ?? "Stage";
  }, [question]);

  if (status === "locked") {
    return (
      <Screen>
        <div className="mx-auto max-w-md p-4">
          <Card>
            <Heading level={2}>Daily limit reached</Heading>
            <Text tone="muted" className="mt-2">
              You’ve used your 1-hour play time for today. Come back tomorrow!
            </Text>
          </Card>
        </div>
      </Screen>
    );
  }
if (status === "summary" && summary) {
  const tp = summary?.totalPoints ?? 0;
  const cc = summary?.correctCount ?? 0;
  const tc = summary?.totalCount ?? 0;
  const sr = summary?.stageReached ?? "basic";

  return (
    <Screen>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <Card>
          <Heading level={2}>Session summary</Heading>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Total points: <b>{tp}</b></li>
            <li>Correct: <b>{cc}</b> / {tc}</li>
            <li>Stage reached: <b>{sr}</b></li>
          </ul>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => begin()} size="lg" className="flex-1">
            Start a new session
          </Button>
          <Button onClick={() => window.location.assign("/leaderboard")} size="lg" variant="outline" className="flex-1">
            View leaderboard
          </Button>
        </div>
      </div>
    </Screen>
  );
}

  if (status === "loading" || status === "idle" || !question) {
    return (
      <Screen>
        <div className="mx-auto max-w-md space-y-4 p-4">
          <div className="h-5 w-40 animate-pulse rounded-lg bg-line" />
          <div className="h-32 animate-pulse rounded-2xl bg-white shadow-card" />
          <div className="h-12 animate-pulse rounded-2xl bg-white shadow-card" />
          <div className="h-12 animate-pulse rounded-2xl bg-white shadow-card" />
          <div className="h-12 animate-pulse rounded-2xl bg-white shadow-card" />
          <div className="h-12 animate-pulse rounded-2xl bg-white shadow-card" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <StageProgress
          stageLabel={stageLabel}
          index={question.index}
          total={question.totalInStage}
          timeLeft={timeLeft}
          timeTotal={question.timeLimitSec}
        />

        <QuestionCard
          text={qText}
          options={qOptions}
          selected={selected ?? null}
          // pass through correct answer highlight when available
          correctOptionId={lastSubmit?.correctOptionId ?? null}
          onSelect={(id) => pickOption(id)}
          disabled={submitting}
        />

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => submit(selected ?? undefined)}
            disabled={!isAnswered || submitting}
            size="lg"
            block
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>

      {/* Penalty modal */}
      <Modal open={showPenalty} onClose={() => setShowPenalty(false)}>
        <div className="space-y-3">
          <Heading level={3}>Incorrect answer</Heading>
          <Text tone="muted">You can continue to the next question but you’ll lose some points, or walk away to end today’s session.</Text>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setShowPenalty(false); void walkAway(); }}>
              Walk away
            </Button>
            <Button className="flex-1" onClick={() => { setShowPenalty(false); void continueWithPenalty(); }}>
              Continue (lose points)
            </Button>
          </div>
        </div>
      </Modal>
    </Screen>
  );
}