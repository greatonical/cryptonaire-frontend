"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: "rounded-2xl shadow-card bg-white text-ink-900",
        style: { border: "1px solid #E7EAF1" },
        duration: 2500,
      }}
    />
  );
}