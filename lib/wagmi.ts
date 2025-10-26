// lib/wagmi/config.ts
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

/**
 * Required env:
 * - NEXT_PUBLIC_WC_PROJECTx_ID
 * Optional:
 * - NEXT_PUBLIC_RPC_URL
 */
const RPC =
  process.env.NEXT_PUBLIC_RPC_URL && process.env.NEXT_PUBLIC_RPC_URL.length > 0
    ? process.env.NEXT_PUBLIC_RPC_URL
    : undefined; // wagmi will warn and fallback to a public endpoint

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: "Cryptonaire",
      preference: "all",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
      // In mini-app webviews there is no place to render a modal. We deep-link.
      showQrModal: false,
      metadata: {
        name: "Cryptonaire",
        description: "Crypto quiz game",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://cryptonaire.xyz",
        icons: ["https://cryptonaire.xyz/icon.png"],
      },
    }),
  ],
  transports: {
    [base.id]: http(RPC),
  },
});