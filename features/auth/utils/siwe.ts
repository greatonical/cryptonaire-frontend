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

  return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}