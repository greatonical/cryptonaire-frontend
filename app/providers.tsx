"use client";

import { ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@lib/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from "wagmi/chains";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <MiniKitProvider chain={base}>
            {children}
          </MiniKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "rounded-2xl shadow-card bg-white text-ink-900",
          style: { border: "1px solid #E7EAF1" },
          duration: 2500,
        }}
      />
    </>
  );
}