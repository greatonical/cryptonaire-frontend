'use client';

import { useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Button } from '@components/design-system/atoms/Button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@lib/store/session.store';
import { farcasterQuickLogin } from '@features/auth/services/farcaster.client';

export default function FarcasterSignInButton({ next = "/home" }: { next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const setJwt = useSessionStore((s) => s.setJwt);
  const setAddress = useSessionStore((s) => s.setAddress);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { token } = await sdk.quickAuth.getToken();
      const res = await farcasterQuickLogin(token);
      setJwt(res.jwt);
      alert(res.jwt)
      if (res.walletAddress) setAddress(res.walletAddress);

      // Ensure the persisted store is flushed before first /home API call
      await new Promise((r) => setTimeout(r, 0));

      toast.success('Signed in with Farcaster');
      router.replace(next);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Sign-in failed. Open in Farcaster to try again.';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full z-50">
      <Button onClick={onClick} block size="lg" disabled={busy}>
        {busy ? 'Connecting…' : 'Sign in with Farcaster'}
      </Button>

      
    </div>
  );
}