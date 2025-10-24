"use client";

import { useEffect, useMemo } from "react";
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

const TARGET_CHAIN = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453);

export default function SignInPage() {
  const router = useRouter();
  const chainId = useChainId();

  const {
    connect,
    connectors,
    isPending: isConnecting,
    status: connectStatus,
  } = useConnect();

  // Prefer an injected/ready connector, but fall back to the first "ready" one
  const preferredConnector = useMemo(() => {
    const ready = connectors.filter((c) => c.ready);
    return (
      ready.find((c) => c.id === "injected") ??
      ready[0] ??
      connectors.find((c) => c.id === "injected") ??
      connectors[0]
    );
  }, [connectors]);

  const { address, isConnected, status: accountStatus } = useAccount();
  const connected = !!address; // <- more robust in some mini-apps
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();

  const setAddress = useSessionStore((s) => s.setAddress);
  const setJwt = useSessionStore((s) => s.setJwt);
  const jwt = useSessionStore((s) => s.jwt);

  // When we actually see an address, persist it so UI flips immediately.
  useEffect(() => {
    if (address) setAddress(address as `0x${string}`);
  }, [address, setAddress]);

  // If already authed, go home
  useEffect(() => {
    if (jwt) router.replace("/home");
  }, [jwt, router]);

  async function handleConnect() {
    try {
      if (!preferredConnector) {
        toast.error("No wallet connector available in this environment.");
        return;
      }

      await connect({
        connector: preferredConnector,
        chainId: TARGET_CHAIN, // force Base chain (fixes “connected but not connected” on some wallets)
      });

      // If the wallet connected on a different chain, try to switch.
      if (chainId && chainId !== TARGET_CHAIN) {
        try {
          await switchChainAsync({ chainId: TARGET_CHAIN });
        } catch {
          // Some in-app wallets don’t support programmatic switching; continue gracefully.
        }
      }

      // As a final fallback, ask the provider for accounts (helps a few mini-apps)
      if (!address && typeof window !== "undefined" && (window as any).ethereum?.request) {
        try {
          await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        } catch {}
      }

      toast.success("Wallet connected");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to connect");
    }
  }

  async function handleSignIn() {
    try {
      if (!address) throw new Error("No wallet connected");
      const { nonce } = await getSiweChallenge(address);
      const domain = window.location.host;
      const uri = window.location.origin.replace(/\/$/, ""); // normalize like server
      const message = buildSiweMessage({
        domain,
        address,
        uri,
        chainId: TARGET_CHAIN,
        nonce,
      });
      const signature = (await signMessageAsync({ message })) as `0x${string}`;
      const { jwt } = await verifySiwe({ message, signature, address });
      setJwt(jwt);
      setAddress(address as `0x${string}`);
      toast.success("Signed in");
      router.replace("/home");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Sign-in failed");
    }
  }

  return (
    <Screen>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4">
        <div className="w-full flex flex-col items-center space-y-2 text-center">
          <CryptonaireIcon className="w-14 h-14" />
          <Heading level={1}>Welcome to Cryptonaire</Heading>
          <Text tone="muted">Connect your wallet to get started.</Text>
        </div>

        {/* Use `connected` (address presence) rather than `isConnected` */}
        {!connected ? (
          <Button
            className="z-10"
            onClick={handleConnect}
            disabled={isConnecting ?? connectStatus === "pending"}
            size="lg"
            variant="primary"
            block
          >
            {isConnecting ?? connectStatus === "pending" ? "Connecting…" : "Connect Wallet"}
          </Button>
        ) : (
          <div className="w-full space-y-3 z-10">
            <Card>
              <Text size="sm">
                Connected as{" "}
                <span className="font-mono">
                  {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}
                </span>
              </Text>
              {chainId !== TARGET_CHAIN && (
                <Text size="xs" tone="danger" className="mt-1">
                  Wrong network. Please switch to Base.
                </Text>
              )}
            </Card>

            <Button onClick={handleSignIn} size="lg" variant="primary" block>
              Sign in with Ethereum
            </Button>
            <Button onClick={() => disconnect()} size="lg" variant="outline" block>
              Disconnect
            </Button>
          </div>
        )}

        <Lottie className="self-center absolute opacity-50" animationData={BackgroundAnimation} loop />
      </div>
    </Screen>
  );
}