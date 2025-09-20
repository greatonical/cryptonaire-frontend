"use client";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Keep simple for MVP; wire dark mode later if needed
  return <>{children}</>;
}