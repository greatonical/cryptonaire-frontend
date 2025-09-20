import { http } from "@lib/api-client";
import { API } from "@lib/endpoints";

export async function getSiweChallenge(address: `0x${string}`): Promise<{ nonce: string }> {
  // Your backend expects { walletAddress } in the body
  const res = await http.post<{ nonce: string }>(API.auth.siweChallenge, {
    walletAddress: address,
  });
  return res; // { nonce }
}

export async function verifySiwe(payload: {
  message: string;
  signature: `0x${string}`;
  address: `0x${string}`;
}) {
  const res = await http.post<any>(API.auth.verify, payload);
  const jwt = res?.token || res?.jwt || res?.accessToken;
  if (!jwt) throw new Error("No token returned from verify");
  return { jwt };
}