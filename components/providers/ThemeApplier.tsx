"use client";

import { useEffect } from "react";
import { useUIStore } from "@lib/store/ui.store";

function applyTheme(t: "light" | "dark") {
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeApplier() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
}