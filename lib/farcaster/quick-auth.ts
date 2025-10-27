// lib/farcaster/quick-auth.ts
// A tiny wrapper around Farcaster AuthKit Quick Auth.
// Works only in the client (Farcaster mini app webview).

export type FarcasterAuthResult = {
  fid: number;
  username?: string | null;
  displayName?: string | null;
  custodyAddress?: `0x${string}` | null;
  pfpUrl?: string | null;
  // raw proofs to send to backend for verification
  message: string;
  signature: `0x${string}`;
  nonce: string;
};

let _loaded: any | null = null;

async function loadAuthKit() {
  if (_loaded) return _loaded;
  // Dynamic import so SSR doesn’t blow up
  const mod = await import("@farcaster/auth-kit");
  _loaded = mod;
  return mod;
}

export function isFarcasterMiniApp() {
  // 1) Official SDK check if available
  // @ts-ignore
  const hasSdk = typeof window !== "undefined" && !!(window as any).farcaster;
  if (hasSdk) return true;

  // 2) UA fallback for Warpcast in-app browser
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    if (/Farcaster|Warpcast/i.test(ua)) return true;
  }
  // 3) query param hint, e.g., ?source=warpcast
  if (typeof window !== "undefined") {
    const src = new URLSearchParams(window.location.search).get("source");
    if (src && /warpcast|farcaster/i.test(src)) return true;
  }
  return false;
}

/**
 * Triggers Farcaster Quick Auth UI and returns the proof you’ll verify on the server.
 */
export async function farcasterQuickAuth(): Promise<FarcasterAuthResult> {
  const { createAuthClient } = await loadAuthKit();

  // You can pass your app's logo/name here; AuthKit shows a native sheet.
  const client = createAuthClient({
    relay: "https://relay.farcaster.xyz", // default relay
  });

  const res = await client.signIn(); // opens Quick Auth native sheet in Warpcast
  // res contains signer proofs and viewer data (fid, username,…)
  return {
    fid: res.fid,
    username: res.username ?? null,
    displayName: res.displayName ?? null,
    custodyAddress: (res.custodyAddress as `0x${string}` | undefined) ?? null,
    pfpUrl: res.pfpUrl ?? null,
    message: res.message as string,
    signature: res.signature as `0x${string}`,
    nonce: res.nonce as string,
  };
}