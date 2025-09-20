"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import cn from "clsx";

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    open ? (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
          aria-hidden
        />
        <div className="absolute inset-x-4 top-24 rounded-2xl border border-line bg-white p-5 shadow-card">
          {children}
        </div>
      </div>
    ) : null,
    document.body
  );
}