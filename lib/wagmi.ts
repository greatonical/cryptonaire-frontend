import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { coinbaseWallet } from "wagmi/connectors";
import { walletConnect } from "wagmi/connectors";

// RPC — keep Base mainnet as safe fallback.
const RPC =
  (process.env.NEXT_PUBLIC_RPC_URL || "").trim() ||
  "https://mainnet.base.org";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Cryptonaire";
const APP_LOGO =
  process.env.NEXT_PUBLIC_APP_LOGO ||
  "https://raw.githubusercontent.com/cryptonaire/assets/main/icon.png";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

const baseConnectors = [
  injected({ shimDisconnect: true }),
  coinbaseWallet({
    appName: APP_NAME,
    appLogoUrl: APP_LOGO,
    enableMobileWalletLink: true, // deep-links to Coinbase on mobile if needed
    reloadOnDisconnect: true,
  }),
];

// Only add WalletConnect if project id is provided
const connectors = WC_PROJECT_ID
  ? [...baseConnectors, walletConnect({ projectId: WC_PROJECT_ID, showQrModal: true })]
  : baseConnectors;

export const wagmiConfig = createConfig({
  chains: [base],
  transports: { [base.id]: http(RPC) },
  connectors,
});