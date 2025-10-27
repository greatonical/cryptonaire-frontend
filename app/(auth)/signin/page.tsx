"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { sdk } from "@farcaster/miniapp-sdk";

import { Screen } from "@components/design-system/layout/Screen";
import { Heading } from "@components/design-system/atoms/Heading";
import { Text } from "@components/design-system/atoms/Text";
import { Card } from "@components/design-system/molecules/Card";
import { Button } from "@components/design-system/atoms/Button";
import Lottie from "lottie-react";
import BackgroundAnimation from "@assets/animations/intro-bg-anim.json";
import FarcasterSignInButton from "@components/auth/FarcasterSignInButton";

import {
  useChainId,
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
} from "wagmi";
import { useSessionStore } from "@lib/store/session.store";
import {
  getSiweChallenge,
  verifySiwe,
} from "@features/auth/services/auth.client";
import { buildSiweMessage } from "@features/auth/utils/siwe";

function SignInInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";

  const [isMini, setIsMini] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsMini(await sdk.isInMiniApp());
      } catch {
        setIsMini(false);
      }
    })();
  }, []);

  const jwt = useSessionStore((s) => s.jwt);
  const setJwt = useSessionStore((s) => s.setJwt);
  const setAddress = useSessionStore((s) => s.setAddress);

  useEffect(() => {
    if (jwt) router.replace(next);
  }, [jwt, router, next]);

  // Non-mini: wallet SIWE
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const injected = useMemo(
    () => connectors.find((c) => c.id === "injected"),
    [connectors]
  );
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  async function handleConnect() {
    try {
      if (!injected) return toast.error("No injected wallet available.");
      await connect({ connector: injected });
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
      const uri = window.location.origin.replace(/\/$/, "");
      const message = buildSiweMessage({
        domain,
        address,
        uri,
        chainId,
        nonce,
      });
      const signature = (await signMessageAsync({ message })) as `0x${string}`;
      const { jwt } = await verifySiwe({ message, signature, address });
      setJwt(jwt);
      setAddress(address);
      await Promise.resolve(); // ensure persist before nav
      router.replace(next);
    } catch (e: any) {
      toast.error(e?.message ?? "Sign-in failed");
    }
  }

  return (
    <Screen>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4">
        <div className="w-full text-center">
          <Heading level={1}>Welcome to Cryptonaire</Heading>
          <Text tone="muted">Connect your wallet to get started.</Text>
        </div>

        {isMini === null ? (
          <Button disabled block size="lg">
            Detecting…
          </Button>
        ) : isMini ? (
          <FarcasterSignInButton next={next} />
        ) : !isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            block
            size="lg"
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        ) : (
          <div className="w-full space-y-3">
            <Card>
              <Text size="sm">
                Connected as{" "}
                <span className="font-mono">{address?.slice(0, 28)}…</span>
              </Text>
            </Card>
            <Button onClick={handleSignIn} block size="lg">
              Sign in with Ethereum
            </Button>
            <Button
              onClick={() => disconnect()}
              block
              size="lg"
              variant="outline"
            >
              Disconnect
            </Button>
          </div>
        )}

        <Lottie
          className="absolute opacity-50"
          animationData={BackgroundAnimation}
          loop
        />
      </div>
    </Screen>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Screen>
          <div className="mx-auto max-w-md p-6">
            <Button disabled block size="lg">
              Loading…
            </Button>
          </div>
        </Screen>
      }
    >
      <SignInInner />
    </Suspense>
  );
}