/**
 * WayangChain — Web3 Service Layer.
 *
 * Phantom multi-chain wallet handling (Solana + EVM) plus the simulated
 * chain adapter used for the demo. Read-only verification never touches a
 * wallet; write operations always require a connected session.
 *
 * When a local blockchain node is available, `signAndSubmit*` functions are
 * the single place to swap in real Solana web3.js / Anchor or Ethers.js
 * transactions — every write path already funnels through them.
 */

export type WalletProviderKind = "solana" | "evm";
export type NetworkName = "Localnet" | "Devnet";

export interface WalletSession {
  address: string;
  provider: WalletProviderKind;
  network: NetworkName;
  simulated: boolean;
}

interface PhantomSolanaProvider {
  isPhantom?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
}

interface PhantomEvmProvider {
  isPhantom?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

/* ---------------- Detection (browser-only, guarded) ---------------- */

export function getPhantomSolana(): PhantomSolanaProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { phantom?: { solana?: PhantomSolanaProvider } }).phantom?.solana;
}

export function getPhantomEvm(): PhantomEvmProvider | undefined {
  if (typeof window === "undefined") return undefined;
  const eth = (window as unknown as { ethereum?: PhantomEvmProvider }).ethereum;
  return eth?.isPhantom ? eth : undefined;
}

export function detectPhantom(): { solana: boolean; evm: boolean } {
  return { solana: !!getPhantomSolana(), evm: !!getPhantomEvm() };
}

/* ---------------- Connection ---------------- */

const DEMO_ADDRESSES = {
  solana: "7X9zKq4LmPw2vNBcD8eFgHaJtUoQiZs3b1aYkRmT2",
  evm: "0x7a2B9cD4E5f67890aBcDeF1234567890aBcD3b1",
} as const;

/** Connect the real Phantom Solana provider. Throws when not installed. */
export async function connectPhantomSolana(): Promise<WalletSession> {
  const provider = getPhantomSolana();
  if (!provider) throw new Error("PHANTOM_SOLANA_NOT_FOUND");
  const res = await provider.connect();
  return {
    address: res.publicKey.toString(),
    provider: "solana",
    network: "Devnet",
    simulated: false,
  };
}

/** Connect the real Phantom EVM provider. Throws when not installed. */
export async function connectPhantomEvm(): Promise<WalletSession> {
  const provider = getPhantomEvm();
  if (!provider) throw new Error("PHANTOM_EVM_NOT_FOUND");
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts?.length) throw new Error("NO_ACCOUNTS");
  return {
    address: accounts[0],
    provider: "evm",
    network: "Devnet",
    simulated: false,
  };
}

/** Demo wallet used when Phantom is not installed (e.g. preview/sandbox). */
export function connectDemoWallet(provider: WalletProviderKind): WalletSession {
  return {
    address: DEMO_ADDRESSES[provider],
    provider,
    network: "Localnet",
    simulated: true,
  };
}

export function truncateAddress(address: string): string {
  if (address.startsWith("0x")) {
    return `${address.slice(0, 5)}...${address.slice(-3)}`;
  }
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

/* ---------------- Signature & transaction simulation ---------------- */

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function randomSolanaSignature(): string {
  let sig = "";
  for (let i = 0; i < 64; i++) {
    sig += BASE58[Math.floor(Math.random() * BASE58.length)];
  }
  return sig;
}

export function randomEvmTxHash(): string {
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += "0123456789abcdef"[Math.floor(Math.random() * 16)];
  }
  return hash;
}

export function txHashFor(provider: WalletProviderKind): string {
  return provider === "solana" ? randomSolanaSignature() : randomEvmTxHash();
}

export function simulatePhantomSignature(): Promise<void> {
  // Placeholder for `provider.signTransaction(...)` / signer.signMessage(...).
  return new Promise((resolve) => setTimeout(resolve, 900));
}

/* ---------------- Simulated IPFS ---------------- */

export function generateIpfsCid(): string {
  let cid = "Qm";
  for (let i = 0; i < 44; i++) {
    cid += BASE58[Math.floor(Math.random() * BASE58.length)];
  }
  return cid;
}

export function ipfsGatewayUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}

export const NETWORK_LABEL: Record<NetworkName, string> = {
  Localnet: "Localnet • Simulasi",
  Devnet: "Devnet • Simulasi",
};
