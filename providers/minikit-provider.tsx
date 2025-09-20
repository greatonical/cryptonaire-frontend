"use client";

import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from "wagmi/chains";
import { ReactNode } from "react";

export function MiniKitProviderRoot({ children }: { children: ReactNode }) {
  // You can pass options here later (e.g., capabilities, app metadata)
  return (
    <MiniKitProvider chain={base}>
      {children}
    </MiniKitProvider>
  );
}