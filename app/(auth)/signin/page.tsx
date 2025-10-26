"use client";

import { useEffect, useMemo } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useChainId,
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

export default function SignInPage() {
  const router = useRouter();
  const chainId = useChainId();

  // useConnect gives us connectors + an async connect
  const {
    connectAsync,
    connectors,
    isPending: isConnecting,
  } = useConnect();

  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const setAddress = useSessionStore((s) => s.setAddress);
  const setJwt = useSessionStore((s) => s.setJwt);
  const jwt = useSessionStore((s) => s.jwt);

  useEffect(() => {
    if (jwt) router.replace("/home");
  }, [jwt, router]);

  const injectedConnector = useMemo(
    () =>
      connectors.find((c) => c.id === "injected" || c.type === "injected"),
    [connectors]
  );
  const wcConnector = useMemo(
    () => connectors.find((c) => c.id === "walletConnect"),
    [connectors]
  );

  async function handleConnect() {
    try {
      const hasInjected =
        typeof window !== "undefined" && (window as any).ethereum;

      // Prefer injected when available (Base App / in-app browsers with provider)
      if (hasInjected && injectedConnector) {
        await connectAsync({ connector: injectedConnector });
        toast.success("Wallet connected");
        return;
      }

      // Farcaster mini-app & other webviews without injected provider:
      if (wcConnector) {
        // Subscribe to wc URI and deep-link to the wallet app.
        const provider: any = await wcConnector.getProvider?.();
        if (provider && typeof provider.on === "function") {
          const onDisplayUri = (uri: string) => {
            // universal deep link many wallets handle
            const deeplink = `wc:${encodeURIComponent(uri)}`;
            window.location.href = deeplink;
          };
          // ensure we don’t stack listeners on retries
          provider.removeListener?.("display_uri", onDisplayUri);
          provider.on("display_uri", onDisplayUri);
        }

        await connectAsync({ connector: wcConnector });
        toast.success("Wallet connected");
        return;
      }

      // Last resort: Coinbase Wallet connector if present but no injected
      const cb = connectors.find((c) => c.id === "coinbaseWallet");
      if (cb) {
        await connectAsync({ connector: cb });
        toast.success("Wallet connected");
        return;
      }

      toast.error(
        "No wallet connector available. Open in Base App or a Farcaster client with WalletConnect."
      );
    } catch (e: any) {
      // WalletConnect often throws “User closed modal” or similar; we unify it
      const msg = e?.message || "Failed to connect";
      toast.error(msg);
      // Optional: console for debugging
      // console.error(e);
    }
  }

  async function handleSignIn() {
    try {
      if (!address) throw new Error("No wallet connected");
      const { nonce } = await getSiweChallenge(address);

      const domain = window.location.host;
      const uri = window.location.origin.replace(/\/$/, ""); // match server normalization
      const message = buildSiweMessage({
        domain,
        address,
        uri,
        chainId,
        nonce,
      });

      // Some in-app browsers need personal_sign fallback; wagmi handles both.
      const signature = (await signMessageAsync({ message })) as `0x${string}`;

      const { jwt } = await verifySiwe({ message, signature, address });
      setJwt(jwt);
      setAddress(address);
      toast.success("Signed in");
      router.replace("/home");
    } catch (e: any) {
      toast.error(e?.message ?? "Sign-in failed");
      // console.error(e);
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

        {!isConnected ? (
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
                Connected with{" "}
                {/* <span className="font-semibold">
                  {connector?.name ?? "Wallet"}
                </span>{" "}
                as{" "} */}
                <span className="font-mono">
                  {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ""}
                </span>
              </Text>
            </Card>

            <Button onClick={handleSignIn} size="lg" variant="primary" block>
              Sign in with Ethereum
            </Button>
            <Button onClick={() => disconnect()} size="lg" variant="outline" block>
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