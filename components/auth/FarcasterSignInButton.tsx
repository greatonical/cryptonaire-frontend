// components/auth/FarcasterSignInButton.tsx
// Purpose: Standalone Farcaster Quick Auth button for Mini Apps

'use client';

import { useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@components/design-system/atoms/Button';
import { Card } from '@components/design-system/molecules/Card';
import { Text } from '@components/design-system/atoms/Text';
import { farcasterQuickLogin } from '@features/auth/services/farcaster.client';
import { useSessionStore } from '@lib/store/session.store';

type Props = { className?: string };

export default function FarcasterSignInButton({ className }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const setJwt = useSessionStore((s) => s.setJwt);
  const setAddress = useSessionStore((s) => s.setAddress);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      // 1) Get Quick-Auth token from Warpcast
      const { token } = await sdk.quickAuth.getToken();

      // 2) Backend verifies & issues app JWT
      const res = await farcasterQuickLogin(token); // POST /auth/farcaster/quick
      const { jwt, userId, walletAddress } = res;

      if (!jwt || !userId) throw new Error('Invalid response from server');

      // 3) Persist session
      setJwt(jwt);
      if (walletAddress) setAddress(walletAddress);

      toast.success('Signed in with Farcaster');
      await sdk.actions.ready(); // be extra sure splash is hidden
      router.replace('/home');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 401 ? 'Farcaster token could not be verified.' : undefined) ||
        (e?.message?.toLowerCase?.().includes('quickauth')
          ? 'Open this in Warpcast to sign in with Farcaster.'
          : undefined) ||
        e?.message ||
        'Sign-in failed';
      setErr(msg);
      toast.error(msg);
      setTimeout(() => setErr(null), 2000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <Button className='cursor-pointer' onClick={onClick} disabled={busy} size="lg" block>
        {busy ? 'Connecting…' : 'Sign in with Farcaster'}
      </Button>
      {/* {err && (
        <Card className="mt-2 text-center">
          <Text tone="danger" size="sm">
            {err}
          </Text>
        </Card>
      )} */}
    </div>
  );
}