// app/FarcasterBoot.tsx
'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export default function FarcasterBoot() {
  useEffect(() => {
    (async () => {
      // Optional: only call inside Mini App context to be tidy
      const inside = await sdk.isInMiniApp();
      if (inside) {
        await sdk.actions.ready(); // hide splash when UI is stable
      }
    })();
  }, []);

  return null;
}