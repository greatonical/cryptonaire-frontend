"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useChainId,
  useSwitchChain,
} from "wagmi";
import {
  getSiweChallenge,
  verifySiwe,
} from "@features/auth/services/auth.client";
import { buildSiweMessage } from "@features/auth/utils/siwe";
import { useSessionStore } from "@lib/store/session.store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Screen } from "@components/design-system/layout/Screen";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Card } from "@components/design-system/molecules/Card";
import { Button } from "@components/design-system/atoms/Button";
import { CryptonaireIcon } from "@components/design-system/atoms/Icon";
import Lottie from "lottie-react";
import BackgroundAnimation from "@assets/animations/intro-bg-anim.json";

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453);

export default function SignInPage() {
  const router = useRouter();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { address: wagmiAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const setAddress = useSessionStore((s) => s.setAddress);
  const setJwt = useSessionStore((s) => s.setJwt);
  const jwt = useSessionStore((s) => s.jwt);

  // --- track a real address no matter what (Wagmi OR raw provider) ---
  const [activeAddress, setActiveAddress] = useState<`0x${string}` | null>(null);
  const accountsWatcherSet = useRef(false);

  // Helper: try several ways to discover an address quickly
  async function detectAddress(): Promise<`0x${string}` | null> {
    // 1) Wagmi already knows
    if (wagmiAddress) return wagmiAddress as `0x${string}`;

    // 2) EIP-1193 injected provider
    const eth = (globalThis as any).ethereum;
    if (eth?.request) {
      // some providers expose selectedAddress synchronously
      if (eth.selectedAddress && /^0x[a-f0-9]{40}$/i.test(eth.selectedAddress)) {
        return eth.selectedAddress as `0x${string}`;
      }
      try {
        const accs = (await eth.request({ method: "eth_accounts" })) as string[] | undefined;
        if (accs && accs[0] && /^0x[a-f0-9]{40}$/i.test(accs[0])) {
          return accs[0] as `0x${string}`;
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  // Keep activeAddress in sync (and listen for account changes)
  useEffect(() => {
    let stop = false;

    const sync = async () => {
      const a = await detectAddress();
      if (!stop) setActiveAddress(a);
    };
    sync();

    const eth = (globalThis as any).ethereum;
    if (eth && !accountsWatcherSet.current && eth.on) {
      accountsWatcherSet.current = true;
      const onAccounts = (accs: string[]) => {
        const next = accs?.[0];
        setActiveAddress(next && /^0x[a-f0-9]{40}$/i.test(next) ? (next as `0x${string}`) : null);
      };
      eth.on("accountsChanged", onAccounts);
      return () => {
        try { eth.removeListener?.("accountsChanged", onAccounts); } catch {}
        accountsWatcherSet.current = false;
        stop = true;
      };
    }

    return () => {
      stop = true;
    };
  }, [wagmiAddress]);

  // If you already have a JWT, go home
  useEffect(() => {
    if (jwt) router.replace("/home");
  }, [jwt, router]);

  // Choose a connector that’s actually usable in mini-apps
  const preferredConnector = useMemo(() => {
    // Prefer injected if present
    const injected = connectors.find((c) => c.id === "injected" || c.type === "injected");
    if (injected) return injected;
    // Next: Coinbase Wallet / WalletConnect if injected not available
    const coinbase = connectors.find((c) => c.id.includes("coinbase"));
    if (coinbase) return coinbase;
    const wc = connectors.find((c) => c.id.includes("walletConnect"));
    if (wc) return wc;
    // Fallback: first connector
    return connectors[0];
  }, [connectors]);

  async function ensureTargetChain() {
    try {
      if (!TARGET_CHAIN_ID || chainId === TARGET_CHAIN_ID) return;
      await switchChainAsync({ chainId: TARGET_CHAIN_ID });
    } catch {
      // Non-fatal; user can still sign, but show a gentle hint
      toast((t) => (
        <div>
          <div className="font-medium">Wrong network</div>
          <div className="text-sm opacity-80">Please switch to Base to continue.</div>
          <button onClick={() => toast.dismiss(t.id)} className="mt-2 underline">Dismiss</button>
        </div>
      ));
    }
  }

  async function handleConnect() {
    try {
      if (!preferredConnector) {
        toast.error("No wallet connector available in this app.");
        return;
      }

      await connectAsync({ connector: preferredConnector });

      // Give providers a tick to populate accounts in mini-apps
      let addr: `0x${string}` | null = null;
      for (let i = 0; i < 15; i++) {
        addr = await detectAddress();
        if (addr) break;
        await new Promise((r) => setTimeout(r, 100));
      }

      if (!addr) {
        toast.error("Connected, but no account was provided by the wallet.");
        return;
      }

      setActiveAddress(addr);
      toast.success("Wallet connected");
      await ensureTargetChain();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to connect");
    }
  }

  async function handleSignIn() {
    try {
      const addr = activeAddress;
      if (!addr) throw new Error("No wallet connected");

      const { nonce } = await getSiweChallenge(addr);
      const domain = window.location.host;
      const uri = window.location.origin.replace(/\/$/, "");

      const message = buildSiweMessage({
        domain,
        address: addr,
        uri,
        chainId: TARGET_CHAIN_ID || chainId,
        nonce,
      });

      // First try Wagmi’s signer
      let signature: `0x${string}`;
      try {
        signature = (await signMessageAsync({ message })) as `0x${string}`;
      } catch {
        // Fallback: EIP-1193 personal_sign (some mini-apps need this)
        const eth = (globalThis as any).ethereum;
        if (!eth?.request) throw new Error("No signer available in this environment");
        const sig = await eth.request({
          method: "personal_sign",
          params: [message, addr],
        });
        signature = sig as `0x${string}`;
      }

      const { jwt } = await verifySiwe({ message, signature, address: addr });
      setJwt(jwt);
      setAddress(addr);
      toast.success("Signed in");
      router.replace("/home");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Sign-in failed");
    }
  }

  const isReady = Boolean(activeAddress);

  return (
    <Screen>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4">
        <div className="w-full flex flex-col items-center space-y-2 text-center">
          <CryptonaireIcon className="w-14 h-14" />
          <Heading level={1}>Welcome to Cryptonaire</Heading>
          <Text tone="muted">Connect your wallet to get started.</Text>
        </div>

        {!isReady ? (
          <Button
            className="z-10"
            onClick={handleConnect}
            disabled={isConnecting}
            size="lg"
            variant="primary"
            block
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        ) : (
          <div className="w-full space-y-3 z-10">
            <Card>
              <Text size="sm">
                Connected as{" "}
                <span className="font-mono">
                  {`${activeAddress?.slice(0, 6)}…${activeAddress?.slice(-4)}`}
                </span>
              </Text>
            </Card>

            <Button onClick={handleSignIn} size="lg" variant="primary" block>
              Sign in with Ethereum
            </Button>
            <Button
              onClick={() => {
                setActiveAddress(null);
                disconnect();
              }}
              size="lg"
              variant="outline"
              block
            >
              Disconnect
            </Button>
          </div>
        )}

        <Lottie
          className="self-center absolute opacity-50"
          animationData={BackgroundAnimation}
          loop
        />
      </div>
    </Screen>
  );
}