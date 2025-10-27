// app/(auth)/signin/page.tsx
// Purpose: Sign-in page that picks Farcaster Quick Auth inside Mini App,
//          otherwise falls back to wallet connect + SIWE for web/Base app.

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Screen } from '@components/design-system/layout/Screen';
import { Heading } from '@components/design-system/atoms/Heading';
import { Text } from '@components/design-system/atoms/Text';
import { Card } from '@components/design-system/molecules/Card';
import { Button } from '@components/design-system/atoms/Button';
import { CryptonaireIcon } from '@components/design-system/atoms/Icon';
import Lottie from 'lottie-react';
import BackgroundAnimation from '@assets/animations/intro-bg-anim.json';

import FarcasterSignInButton from '@components/auth/FarcasterSignInButton';
import { sdk } from '@farcaster/miniapp-sdk';

import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useChainId,
} from 'wagmi';
import { useSessionStore } from '@lib/store/session.store';
import { getSiweChallenge, verifySiwe } from '@features/auth/services/auth.client';
import { buildSiweMessage } from '@features/auth/utils/siwe';

export default function SignInPage() {
  const router = useRouter();

  // ---------- Farcaster detection ----------
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const inside = await sdk.isInMiniApp();
        setIsMiniApp(inside);
        if (inside) await sdk.actions.ready();
      } catch {
        setIsMiniApp(false);
      }
    })();
  }, []);

  // If we don't yet know, keep the UI calm
  if (isMiniApp === null) {
    return (
      <Screen>
        <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4">
          <CryptonaireIcon className="w-14 h-14" />
          <Heading level={1}>Welcome to Cryptonaire</Heading>
          <Text tone="muted">Preparing…</Text>
          <Lottie className="self-center absolute opacity-50" animationData={BackgroundAnimation} loop />
        </div>
      </Screen>
    );
  }

  return isMiniApp ? <FarcasterSignInView /> : <WalletSignInView />;
}

// ---------- Mini App (Farcaster Quick Auth) ----------
function FarcasterSignInView() {
  return (
    <Screen>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4">
        <div className="w-full flex flex-col items-center space-y-2 text-center">
          <CryptonaireIcon className="w-14 h-14" />
          <Heading level={1}>Welcome to Cryptonaire</Heading>
          <Text tone="muted">Sign in to get started</Text>
        </div>

        <FarcasterSignInButton className="w-full z-50" />

        <Lottie className="self-center absolute opacity-50" animationData={BackgroundAnimation} loop />
      </div>
    </Screen>
  );
}

// ---------- Web / Base app (wallet + SIWE) ----------
function WalletSignInView() {
  const router = useRouter();
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const injectedConnector = useMemo(() => connectors.find((c) => c.id === 'injected'), [connectors]);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const setAddress = useSessionStore((s) => s.setAddress);
  const setJwt = useSessionStore((s) => s.setJwt);
  const jwt = useSessionStore((s) => s.jwt);

  useEffect(() => {
    if (jwt) router.replace('/home');
  }, [jwt, router]);

  async function handleConnect() {
    try {
      if (!injectedConnector) {
        toast.error('No injected wallet available. Open in Base App or a supported wallet.');
        return;
      }
      await connect({ connector: injectedConnector });
      toast.success('Wallet connected');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to connect');
    }
  }

  async function handleSignIn() {
    try {
      if (!address) throw new Error('No wallet connected');
      const { nonce } = await getSiweChallenge(address);
      const domain = window.location.host;
      const uri = window.location.origin.replace(/\/$/, '');
      const message = buildSiweMessage({ domain, address, uri, chainId, nonce });
      const signature = (await signMessageAsync({ message })) as `0x${string}`;
      const { jwt } = await verifySiwe({ message, signature, address });
      setJwt(jwt);
      setAddress(address);
      toast.success('Signed in');
      router.replace('/home');
    } catch (e: any) {
      toast.error(e?.message ?? 'Sign-in failed');
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
          <Button className="z-10 w-full" onClick={handleConnect} disabled={isConnecting} size="lg" variant="primary" block>
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="w-full space-y-3 z-10">
            <Card>
              <Text size="sm">
                Connected as{' '}
                <span className="font-mono">{address ? `${address.slice(0, 28)}...` : ''}</span>
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

        <Lottie className="self-center absolute opacity-50" animationData={BackgroundAnimation} loop />
      </div>
    </Screen>
  );
}