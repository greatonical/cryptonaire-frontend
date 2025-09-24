"use client";

import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@lib/store/session.store";

export default function Page() {
  const router = useRouter();
  const jwt = useSessionStore((s) => s.jwt);

  useEffect(() => {
    // Smooth client redirect based on auth state
    if (jwt) router.replace("/home");
    else router.replace("/signin");
  }, [jwt, router]);

  useLayoutEffect(() => {
    import("eruda").then((eruda) => eruda.default.init());
  }, []);

  // Tiny splash while we redirect
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background">
      <div className="rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-600 shadow-card animate-pulse">
        Loading…
      </div>
    </main>
  );
}
