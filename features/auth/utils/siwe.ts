import { SiweMessage } from "siwe";

export function buildSiweMessage(params: {
  domain: string;
  address: `0x${string}`;
  statement?: string;
  uri: string;
  version?: "1";
  chainId: number;
  nonce: string;
  issuedAt?: string;
}) {
  const {
    domain,
    address,
    statement = "Sign in to Cryptonaire",
    uri,
    version = "1",
    chainId,
    nonce,
    issuedAt = new Date().toISOString(),
  } = params;

  const m = new SiweMessage({
    domain,
    address,
    statement,
    uri,
    version,
    chainId,
    nonce,
    issuedAt,
  });

  return m.prepareMessage(); // canonical EIP-4361 string
}