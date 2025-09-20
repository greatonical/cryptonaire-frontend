"use client";

import { http, createConfig, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { ReactNode } from "react";
import { getPublicEnv } from "@lib/env";

const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http(getPublicEnv().NEXT_PUBLIC_RPC_URL || undefined),
  },
});

export function WagmiProviderRoot({ children }: { children: ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}