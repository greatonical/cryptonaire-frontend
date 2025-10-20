"use client";

import { Protected } from "@components/guards/Protected";
import StageProgress from "@components/game/StageProgress";
import QuestionCard from "@components/game/QuestionCard";
import { useGameSession } from "@features/game/hooks/use-game-session";
import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Screen } from "@components/design-system/layout/Screen";
import { Card } from "@components/design-system/molecules/Card";
import { Button } from "@components/design-system/atoms/Button";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Modal } from "@components/design-system/molecules/Modal";
import { useSessionStore } from "@lib/store/session.store";
import Lottie from "lottie-react";

// Lottie assets
import OopsAnim from "@assets/animations/oops.json";
import WalkAwayAnim from "@assets/animations/sad.json";

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
  const [showWalkAway, setShowWalkAway] = useState(false);
  const [ctaLabel, setCtaLabel] = useState<string>("Start a new session");

  // session store
  const lastSessionAt = useSessionStore((s) => s.lastSessionAt);
  const hasActiveSession = useSessionStore((s) => s.hasActiveSession);

  // -------------------- SOUND (with unlock) --------------------
  // Keep a single Audio instance for the whole session
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  // Create and pre-load the audio once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!correctAudioRef.current) {
      const a = new Audio("/sfx/correct.mp3"); // MUST exist in public/sfx/correct.mp3
      a.preload = "auto";
      // a.load() is optional, but helps on some browsers
      try { a.load(); } catch {}
      correctAudioRef.current = a;
    }

    // On the very first user interaction, play at 0 volume and pause.
    // This "unlocks" audio so later .play() calls are allowed.
    const unlock = () => {
      if (unlockedRef.current || !correctAudioRef.current) return;
      const a = correctAudioRef.current;
      const prevVol = a.volume;
      a.volume = 0;
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
          a.volume = prevVol;
          unlockedRef.current = true;
        })
        .catch(() => {
          // If it failed, we keep the listeners – user may interact again.
        });
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock as any);
      window.removeEventListener("touchstart", unlock as any);
    };
  }, []);

  // Play sound when the last submission was correct
  useEffect(() => {
    if (lastSubmit?.correct && correctAudioRef.current) {
      const a = correctAudioRef.current;
      a.currentTime = 0;
      // Don't await; we don't want to block UI if it throws
      a.play().catch(() => {});
    }
  }, [lastSubmit?.correct]);
  // -------------------------------------------------------------

  useEffect(() => {
    if (status === "idle") begin();
  }, [status, begin]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Compute CTA label: Resume for active or <24h since last; else Start
  useEffect(() => {
    const last = lastSessionAt ?? 0;
    const day = 24 * 60 * 60 * 1000;
    const delta = Date.now() - last;
    setCtaLabel(hasActiveSession ? "Resume" : delta < day ? "Resume" : "Start a new session");
  }, [status, lastSessionAt, hasActiveSession]);

  // Show penalty when incorrect
  useEffect(() => {
    if (status === "question" && lastSubmit && !lastSubmit.correct) {
      setShowPenalty(true);
    } else {
      setShowPenalty(false);
    }
  }, [status, lastSubmit]);

  const submitting = status === "submitting";

  // Normalize question shape safely (handles question.body.*)
  const qText = useMemo(() => {
    // @ts-expect-error backend may nest under body
    return question?.text ?? question?.body?.text ?? "";
  }, [question]);

  const qOptions = useMemo(() => {
    // @ts-expect-error backend may nest under body
    const opts = question?.options ?? question?.body?.options;
    return Array.isArray(opts) ? opts : [];
  }, [question]);

  const stageLabel = useMemo(() => {
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
          <Text size="xs" tone="muted" className="mt-6 text-center">
            Fraudulent activities are monitored and might get you disqualified.
          </Text>
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
              {ctaLabel}
            </Button>
            <Button
              onClick={() => window.location.assign("/leaderboard")}
              size="lg"
              variant="outline"
              className="flex-1"
            >
              View leaderboard
            </Button>
          </div>

          <Text size="xs" tone="muted" className="mt-6 text-center">
            Fraudulent activities are monitored and might get you disqualified.
          </Text>
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
          <Text size="xs" tone="muted" className="mt-6 text-center">
            Fraudulent activities are monitored and might get you disqualified.
          </Text>
        </div>
      </Screen>
    );
  }

  const handleWalkAway = async () => {
    setShowPenalty(false);
    setShowWalkAway(true);
    setTimeout(async () => {
      await walkAway();
      setShowWalkAway(false);
    }, 900);
  };

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

        <Text size="xs" tone="muted" className="mt-6 text-center">
          Fraudulent activities are monitored and might get you disqualified.
        </Text>
      </div>

      {/* Incorrect answer modal */}
      <Modal open={showPenalty} onClose={() => setShowPenalty(false)}>
        <div className="space-y-3 mx-auto max-w-md">
          <div className="mx-auto h-32 w-32">
            <Lottie animationData={OopsAnim} loop={false} />
          </div>
          <Heading level={3}>Incorrect answer</Heading>
          <Text tone="muted">
            Continue to keep playing (you’ll lose some points), or walk away to
            end today’s session.
          </Text>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleWalkAway}>
              Walk away
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowPenalty(false);
                void continueWithPenalty("stepdown");
              }}
            >
              Continue and go back to the previous level
            </Button>
          </div>
        </div>
      </Modal>

      {/* Walk-away animation */}
      <Modal open={showWalkAway} onClose={() => setShowWalkAway(false)}>
        <div className="flex flex-col items-center space-y-2">
          <div className="mx-auto h-40 w-40">
            <Lottie animationData={WalkAwayAnim} loop={false} />
          </div>
          <Heading level={3}>Session ended</Heading>
          <Text tone="muted">See you next time 👋</Text>
        </div>
      </Modal>
    </Screen>
  );
}