/**
 * WayangChain — mock on-chain registry.
 *
 * Simulated program state: wayang certificates with full provenance chains.
 * Reads are public (read-only verifier mode needs no wallet); writes go
 * through `applyMint / applyLocationUpdate / applyOwnershipTransfer`, which
 * mirror the Anchor / contract calls they will become when a real node is
 * wired into web3Service.ts.
 */

import { generateIpfsCid, simulatePhantomSignature, txHashFor, type WalletSession } from "./web3Service";
import arjunaImg from "@/assets/wayang-arjuna.jpg";
import bimaImg from "@/assets/wayang-bima.jpg";
import hanomanImg from "@/assets/wayang-hanoman.jpg";

export type ProvenanceKind = "genesis" | "location" | "transfer";

export interface ProvenanceStep {
  kind: ProvenanceKind;
  title: string;
  detail: string;
  actor: string;
  txHash: string;
  timestamp: string;
}

export interface WayangRecord {
  id: string;
  tokoh: string;
  gaya: string;
  pengrajin: string;
  bahanKulit: string;
  tanggalPembuatan: string;
  asal: string;
  harga: string;
  imageKey: "arjuna" | "bima" | "hanoman";
  cid: string;
  certCid: string;
  genesisTx: string;
  currentOwner: string;
  status: string;
  lokasi: string;
  provenance: ProvenanceStep[];
}

export const RECORD_IMAGES: Record<WayangRecord["imageKey"], string> = {
  arjuna: arjunaImg,
  bima: bimaImg,
  hanoman: hanomanImg,
};

/** Well-known demo wallets for the seeded registry. */
export const DEMO_ROLES = {
  artisan: { label: "Dompet Pengrajin (Demo)", address: "7X9zKq4LmPw2vNBcD8eFgHaJtUoQiZs3b1aYkRmT2" },
  gallery: { label: "Dompet Galeri (Demo)", address: "4KqPnR8sVbWm3JdXeCgFhLuItAoYpZq9Nv2Bx7Mw6D" },
  collector: { label: "Dompet Kolektor (Demo)", address: "9yTcMw2vNBcD8eFgHaJtUoQiZs3b1aYkRm7X9zKq4LmP" },
} as const;

function isoAt(date: string, hour: number): string {
  return `${date}T${String(hour).padStart(2, "0")}:00:00Z`;
}

function seedRegistry(): WayangRecord[] {
  const collector = DEMO_ROLES.collector.address;
  const gallery = DEMO_ROLES.gallery.address;
  const artisan = DEMO_ROLES.artisan.address;

  return [
    {
      id: "WC-SOLO-0001",
      tokoh: "Arjuna Sungging Solo",
      gaya: "Gaya Sungging Solo (Surakarta)",
      pengrajin: "Ki Slamet Raharjo",
      bahanKulit: "Kulit Sapi Prambanan, tebal 0.5 mm",
      tanggalPembuatan: "12 Januari 2026",
      asal: "Solo, Surakarta",
      harga: "Rp 4.500.000",
      imageKey: "arjuna",
      cid: "ipfs://QmX8z7ArjunaWayangChainSoloMeta1a9b",
      certCid: "ipfs://QmCertArjunaWayangChainSolo9c2d1e",
      genesisTx: "3bKqWayangChainGenesisSoloArjuna7X9zKq4LmPw",
      currentOwner: collector,
      status: "Dimiliki Kolektor",
      lokasi: "Koleksi pribadi, Jakarta",
      provenance: [
        {
          kind: "genesis",
          title: "Genesis Block — Dicetak Pengrajin",
          detail: "Arjuna Sungging Solo didaftarkan ke blockchain oleh Ki Slamet Raharjo",
          actor: artisan,
          txHash: "3bKqWayangChainGenesisSoloArjuna7X9zKq4LmPw",
          timestamp: isoAt("2026-01-12", 9),
        },
        {
          kind: "location",
          title: "Galeri Seni Jogja — Ready for Sale",
          detail: "Kiriman diterima dan dipajang di Galeri Seni Jogja",
          actor: gallery,
          txHash: "5gFhWayangChainLocationJogjaArjuna4KqPnR8sVbW",
          timestamp: isoAt("2026-01-28", 14),
        },
        {
          kind: "transfer",
          title: "Transfer Kepemilikan ke Kolektor",
          detail: "Kepemilikan berpindah dari galeri ke kolektor terverifikasi",
          actor: collector,
          txHash: "8dXeWayangChainTransferArjunaCollector9yTcMw2v",
          timestamp: isoAt("2026-02-14", 16),
        },
      ],
    },
    {
      id: "WC-YOG-0007",
      tokoh: "Bima Gadragad Yogyakarta",
      gaya: "Gaya Kraton Yogyakarta",
      pengrajin: "Ki Suryo Purnomo",
      bahanKulit: "Kulit Kerbau Prambanan, tebal 0.6 mm",
      tanggalPembuatan: "3 Maret 2026",
      asal: "Yogyakarta",
      harga: "Rp 6.250.000",
      imageKey: "bima",
      cid: "ipfs://QmB2m4WayangChainYogyaBimaMeta7c8f2b",
      certCid: "ipfs://QmCertBimaWayangChainYogya4e1a9f",
      genesisTx: "2mNbWayangChainGenesisYogyaBimaKiSuryoPurnomoX1",
      currentOwner: gallery,
      status: "Ready for Sale",
      lokasi: "Galeri Seni Jogja",
      provenance: [
        {
          kind: "genesis",
          title: "Genesis Block — Dicetak Pengrajin",
          detail: "Bima Gadragad didaftarkan ke blockchain oleh Ki Suryo Purnomo",
          actor: artisan,
          txHash: "2mNbWayangChainGenesisYogyaBimaKiSuryoPurnomoX1",
          timestamp: isoAt("2026-03-03", 10),
        },
        {
          kind: "location",
          title: "Galeri Seni Jogja — Ready for Sale",
          detail: "Dipajang di etalase galeri mitra",
          actor: gallery,
          txHash: "6hLmWayangChainLocationJogjaBimaGalleryReadyX2",
          timestamp: isoAt("2026-03-15", 11),
        },
      ],
    },
    {
      id: "WC-JKT-0042",
      tokoh: "Hanoman Gaya Bandung",
      gaya: "Gaya Sungging Pantura",
      pengrajin: "Rasid Abdul Garman",
      bahanKulit: "Kulit Sapi Garut, tebal 0.5 mm",
      tanggalPembuatan: "21 Februari 2026",
      asal: "Bandung, Jawa Barat",
      harga: "Rp 3.800.000",
      imageKey: "hanoman",
      cid: "ipfs://QmH9n3WayangChainBandungHanomanMeta5d7e1a",
      certCid: "ipfs://QmCertHanomanWayangChainBandung8b3c2f",
      genesisTx: "4pQwWayangChainGenesisBandungHanomanRasidGarman3",
      currentOwner: artisan,
      status: "Studi Kasus — Terverifikasi",
      lokasi: "Workshop pengrajin, Bandung",
      provenance: [
        {
          kind: "genesis",
          title: "Genesis Block — Dicetak Pengrajin",
          detail: "Hanoman didaftarkan langsung oleh pengrajin sebagai studi kasus verifikasi publik",
          actor: artisan,
          txHash: "4pQwWayangChainGenesisBandungHanomanRasidGarman3",
          timestamp: isoAt("2026-02-21", 13),
        },
      ],
    },
  ];
}

const STORAGE_KEY = "wayangchain.registry.v1";

let registry: WayangRecord[] | null = null;

function getRegistryOnce(): WayangRecord[] {
  if (registry) return registry;
  registry = seedRegistry();
  return registry;
}

export function getRegistry(): WayangRecord[] {
  return getRegistryOnce();
}

export function findRecord(query: string): WayangRecord | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  const clean = q.startsWith("ipfs://") ? q.slice(7) : q;
  return getRegistryOnce().find((r) => {
    const cidBare = r.cid.replace("ipfs://", "");
    const certBare = r.certCid.replace("ipfs://", "");
    return (
      r.id.toLowerCase() === q ||
      cidBare.toLowerCase() === clean ||
      cidBare.toLowerCase().startsWith(clean.replace("ipfs://", "")) ||
      certBare.toLowerCase().startsWith(clean.replace("ipfs://", "")) ||
      r.tokoh.toLowerCase() === q
    );
  });
}

export function findRecordsForOwner(owner: string): WayangRecord[] {
  return getRegistryOnce().filter((r) => r.currentOwner.toLowerCase() === owner.toLowerCase());
}

/* ---------------- Mutations (event-handler only) ---------------- */

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch {
    // Storage unavailable — demo state stays in memory.
  }
}

/** Restore the registry from localStorage. Call once from a client effect. */
export function hydrateRegistryFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as WayangRecord[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      registry = parsed;
      return true;
    }
  } catch {
    // ignore malformed cache
  }
  return false;
}

export function resetRegistry(): void {
  registry = seedRegistry();
  persist();
}

export interface MintInput {
  tokoh: string;
  gaya: string;
  bahanKulit: string;
  tanggalSelesai: string;
  harga: string;
  asal: string;
  pengrajin: string;
}

/** Mint Genesis Block — simulates the Anchor `initialize_certificate` call. */
export async function applyMint(
  input: MintInput,
  session: WalletSession,
  imageKey: WayangRecord["imageKey"] = "arjuna",
  fileCid?: string,
): Promise<WayangRecord> {
  await simulatePhantomSignature();
  const record: WayangRecord = {
    id: `WC-${(input.asal || "SOLO").slice(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    tokoh: input.tokoh,
    gaya: input.gaya,
    pengrajin: input.pengrajin,
    bahanKulit: input.bahanKulit,
    tanggalPembuatan: input.tanggalSelesai,
    asal: input.asal,
    harga: input.harga,
    imageKey,
    cid: fileCid ?? `ipfs://${generateIpfsCid()}`,
    certCid: `ipfs://${generateIpfsCid()}`,
    genesisTx: txHashFor(session.provider),
    currentOwner: session.address,
    status: "Genesis — Terdaftar Pengrajin",
    lokasi: `Workshop pengrajin, ${input.asal}`,
    provenance: [
      {
        kind: "genesis",
        title: "Genesis Block — Dicetak Pengrajin",
        detail: `${input.tokoh} didaftarkan ke blockchain oleh ${input.pengrajin}`,
        actor: session.address,
        txHash: "",
        timestamp: new Date().toISOString(),
      },
    ],
  };
  record.provenance[0].txHash = record.genesisTx;
  registry = [record, ...getRegistryOnce()];
  persist();
  return record;
}

/** Update the physical location / sale status — simulates `update_location`. */
export async function applyLocationUpdate(
  recordId: string,
  lokasi: string,
  status: string,
  session: WalletSession,
): Promise<WayangRecord> {
  await simulatePhantomSignature();
  let updated: WayangRecord | undefined;
  registry = getRegistryOnce().map((r) => {
    if (r.id !== recordId) return r;
    updated = {
      ...r,
      lokasi,
      status,
      provenance: [
        ...r.provenance,
        {
          kind: "location",
          title: `${lokasi} — ${status}`,
          detail: `Jejak lokasi fisik diperbarui menjadi "${lokasi}" dengan status "${status}"`,
          actor: session.address,
          txHash: txHashFor(session.provider),
          timestamp: new Date().toISOString(),
        },
      ],
    };
    return updated;
  });
  if (!updated) throw new Error("RECORD_NOT_FOUND");
  persist();
  return updated;
}

/** Transfer ownership — simulates `transfer_ownership(new_owner)`. */
export async function applyOwnershipTransfer(
  recordId: string,
  newOwner: string,
  session: WalletSession,
): Promise<WayangRecord> {
  await simulatePhantomSignature();
  let updated: WayangRecord | undefined;
  registry = getRegistryOnce().map((r) => {
    if (r.id !== recordId) return r;
    updated = {
      ...r,
      currentOwner: newOwner,
      status: "Dimiliki Kolektor",
      lokasi: "Koleksi pribadi kolektor",
      provenance: [
        ...r.provenance,
        {
          kind: "transfer",
          title: "Transfer Kepemilikan",
          detail: `Kepemilikan berpindah dari ${session.address.slice(0, 6)}… ke ${newOwner.slice(0, 6)}…`,
          actor: newOwner,
          txHash: txHashFor(session.provider),
          timestamp: new Date().toISOString(),
        },
      ],
    };
    return updated;
  });
  if (!updated) throw new Error("RECORD_NOT_FOUND");
  persist();
  return updated;
}
