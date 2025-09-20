// Read public env (client-safe)
export function getPublicEnv() {
  return {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "",
    NEXT_PUBLIC_CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453),
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Cryptonaire",
  };
}