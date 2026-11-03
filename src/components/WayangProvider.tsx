import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  connectDemoWallet,
  connectPhantomEvm,
  connectPhantomSolana,
  detectPhantom,
  type WalletProviderKind,
  type WalletSession,
} from "@/lib/web3Service";
import {
  applyLocationUpdate,
  applyMint,
  applyOwnershipTransfer,
  findRecord,
  findRecordsForOwner,
  getRegistry,
  hydrateRegistryFromStorage,
  type MintInput,
  type WayangRecord,
} from "@/lib/wayangStore";

const SESSION_KEY = "wayangchain.session.v1";

interface WayangContextValue {
  session: WalletSession | null;
  walletsDetected: { solana: boolean; evm: boolean };
  connect: (kind: WalletProviderKind) => Promise<void>;
  connectDemo: (kind: WalletProviderKind) => void;
  disconnect: () => void;
  registry: WayangRecord[];
  myRecords: WayangRecord[];
  verify: (query: string) => WayangRecord | undefined;
  mint: (
    input: MintInput,
    imageKey?: WayangRecord["imageKey"],
    fileCid?: string,
  ) => Promise<WayangRecord>;
  updateLocation: (id: string, lokasi: string, status: string) => Promise<WayangRecord>;
  transfer: (id: string, newOwner: string) => Promise<WayangRecord>;
  resetDemo: () => void;
}

const WayangContext = createContext<WayangContextValue | null>(null);

export function WayangProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [walletsDetected, setWalletsDetected] = useState({ solana: false, evm: false });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setWalletsDetected(detectPhantom());
    hydrateRegistryFromStorage();
    setVersion((v) => v + 1);
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as WalletSession);
    } catch {
      // ignore malformed session cache
    }
  }, []);

  const persistSession = useCallback((next: WalletSession | null) => {
    setSession(next);
    try {
      if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  const connect = useCallback(
    async (kind: WalletProviderKind) => {
      try {
        const next =
          kind === "solana" ? await connectPhantomSolana() : await connectPhantomEvm();
        persistSession(next);
        toast.success("Phantom Wallet terhubung", {
          description: `${kind === "solana" ? "Solana" : "EVM"} • Devnet`,
        });
      } catch {
        throw new Error("PHANTOM_NOT_DETECTED");
      }
    },
    [persistSession],
  );

  const connectDemo = useCallback(
    (kind: WalletProviderKind) => {
      persistSession(connectDemoWallet(kind));
      toast.info("Dompet demo terhubung (simulasi Phantom)");
    },
    [persistSession],
  );

  const disconnect = useCallback(() => {
    persistSession(null);
    toast.info("Dompet terputus");
  }, [persistSession]);

  const mint = useCallback(
    async (input: MintInput, imageKey?: WayangRecord["imageKey"], fileCid?: string) => {
      if (!session) throw new Error("WALLET_REQUIRED");
      const record = await applyMint(input, session, imageKey, fileCid);
      setVersion((v) => v + 1);
      toast.success("Genesis Block dicetak 🎉", {
        description: `${record.id} • Tx ${record.genesisTx.slice(0, 10)}…`,
      });
      return record;
    },
    [session],
  );

  const updateLocation = useCallback(
    async (id: string, lokasi: string, status: string) => {
      if (!session) throw new Error("WALLET_REQUIRED");
      const record = await applyLocationUpdate(id, lokasi, status, session);
      setVersion((v) => v + 1);
      toast.success("Jejak lokasi diperbarui", {
        description: `${record.id} • ${lokasi}`,
      });
      return record;
    },
    [session],
  );

  const transfer = useCallback(
    async (id: string, newOwner: string) => {
      if (!session) throw new Error("WALLET_REQUIRED");
      const record = await applyOwnershipTransfer(id, newOwner, session);
      setVersion((v) => v + 1);
      toast.success("Kepemilikan ditransfer", {
        description: `${record.id} → ${newOwner.slice(0, 8)}…`,
      });
      return record;
    },
    [session],
  );

  const verify = useCallback((query: string) => findRecord(query), []);

  const value = useMemo<WayangContextValue>(
    () => ({
      session,
      walletsDetected,
      connect,
      connectDemo,
      disconnect,
      registry: getRegistry(),
      myRecords: session ? findRecordsForOwner(session.address) : [],
      verify,
      mint,
      updateLocation,
      transfer,
      resetDemo: () => setVersion((v) => v + 1),
      version,
    }),
    [session, walletsDetected, connect, connectDemo, disconnect, verify, mint, updateLocation, transfer, version],
  );

  return <WayangContext.Provider value={value}>{children}</WayangContext.Provider>;
}

export function useWayang(): WayangContextValue {
  const ctx = useContext(WayangContext);
  if (!ctx) throw new Error("useWayang must be used within WayangProvider");
  return ctx;
}
