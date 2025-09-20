"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@lib/store/session.store";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function Protected({ children, fallback }: Props) {
  const jwt = useSessionStore((s) => s.jwt);
  const router = useRouter();

  useEffect(() => {
    if (!jwt) router.replace("/signin");
  }, [jwt, router]);

  if (!jwt) {
    return (
      (fallback ?? (
        <main className="min-h-dvh flex items-center justify-center bg-background">
          <div className="rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-600 shadow-card">
            Redirecting…
          </div>
        </main>
      ))
    );
  }

  return <>{children}</>;
}