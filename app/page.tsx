"use client";

import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@lib/store/session.store";

export default function Page() {
  const router = useRouter();
  const jwt = useSessionStore((s) => s.jwt);
  const {clear} = useSessionStore()

  const onboardingSeen = useSessionStore((s) => s.onboardingSeen ?? false);

  useEffect(() => {
    if (!onboardingSeen) router.replace("/onboarding");
  }, [onboardingSeen, router]);

  useEffect(() => {
    // Smooth client redirect based on auth state
    if (jwt && onboardingSeen) router.replace("/home");
    else if (!onboardingSeen) router.replace("/onboarding");
    else router.replace("/signin");
  }, [jwt, router, onboardingSeen]);

  useLayoutEffect(() => {
    import("eruda").then((eruda) => eruda.default.init());
  }, []);


  // useEffect(()=>{clear()},[])
  // Tiny splash while we redirect
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background">
      <div className="rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-600 shadow-card animate-pulse">
        Loading…
      </div>
    </main>
  );
}
