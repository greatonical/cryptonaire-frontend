"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Simple countdown hook.
 * Resets when `key` changes (e.g., question id).
 */
export function useCountdown(
  initialSec: number,
  key: string | number,
  onExpire?: () => void
) {
  const [timeLeft, setTimeLeft] = useState(initialSec);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // reset on key change
    setTimeLeft(initialSec);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          onExpire?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return timeLeft;
}