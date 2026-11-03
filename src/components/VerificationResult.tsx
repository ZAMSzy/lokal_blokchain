import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { RECORD_IMAGES, type ProvenanceStep, type WayangRecord } from "@/lib/wayangStore";
import { truncateAddress } from "@/lib/web3Service";
import { Hammer, KeyRound, ScanSearch, Store, TriangleAlert } from "lucide-react";

const KIND_META: Record<
  ProvenanceStep["kind"],
  { icon: typeof Hammer; label: string; classes: string }
> = {
  genesis: { icon: Hammer, label: "Genesis Block", classes: "border-primary/50 bg-primary/10 text-primary" },
  location: { icon: Store, label: "Lokasi Galeri", classes: "border-accent bg-accent text-accent-foreground" },
  transfer: { icon: KeyRound, label: "Transfer", classes: "border-verified/50 bg-verified/10 text-verified" },
};

function DataGrid({ record }: { record: WayangRecord }) {
  const rows: [string, string][] = [
    ["Tokoh Wayang", record.tokoh],
    ["Gaya Sungging", record.gaya],
    ["Nama Pengrajin", record.pengrajin],
    ["Bahan Kulit", record.bahanKulit],
    ["Tanggal Pembuatan", record.tanggalPembuatan],
    ["Tempat Asal", record.asal],
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProvenanceTimeline({ record }: { record: WayangRecord }) {
  return (
    <div>
      <h3 className="font-display mb-4 text-sm font-semibold uppercase tracking-widest text-gold-soft">
        Provenance Timeline — Jejak on-chain
      </h3>
      <ol className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-primary/60 before:via-border before:to-verified/60">
        {record.provenance.map((step, i) => {
          const meta = KIND_META[step.kind];
          const Icon = meta.icon;
          return (
            <li key={i} className="relative flex gap-4 pl-0">
              <span
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${meta.classes}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  Tx: {step.txHash.slice(0, 18)}… • {step.actor.slice(0, 6)}… •{" "}
                  {new Date(step.timestamp).toLocaleString("id-ID")}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function VerificationResult({ record }: { record: WayangRecord }) {
  const img = RECORD_IMAGES[record.imageKey];
  return (
    <Card className="overflow-hidden border-verified/30 bg-card glow-verified">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-verified/25 bg-verified/10 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="animate-pulse-verified flex h-9 w-9 items-center justify-center rounded-full bg-verified/15">
              <ScanSearch className="h-5 w-5 text-verified" />
            </span>
            <div>
              <p className="font-display text-sm font-bold tracking-wide text-verified">
                VERIFIED AUTHENTIC
              </p>
              <p className="text-[11px] text-muted-foreground">Status: {record.status}</p>
            </div>
          </div>
          <Badge className="bg-verified text-verified-foreground glow-verified">
            ON BLOCKCHAIN
          </Badge>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-[240px_1fr]">
          <figure className="animate-float-slow self-start">
            <img
              src={img}
              alt={record.tokoh}
              width={240}
              height={320}
              loading="lazy"
              className="rounded-xl border border-primary/30 object-cover shadow-lg"
            />
            <figcaption className="mt-2 text-center text-[11px] text-muted-foreground">
              Gateway IPFS (simulasi): <span className="font-mono">{record.cid}</span>
            </figcaption>
          </figure>

          <div className="min-w-0 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-gradient-gold">{record.tokoh}</h2>
                <Badge variant="outline" className="hairline-gold font-mono text-[11px]">
                  {record.id}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Metadata tervalidasi langsung dari blockchain — tidak dapat diubah tanpa tanda tangan
                pemilik.
              </p>
            </div>

            <DataGrid record={record} />

            <div className="grid gap-3 rounded-xl border border-primary/15 bg-secondary/30 p-4 text-xs sm:grid-cols-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Genesis Tx
                </p>
                <p className="mt-0.5 truncate font-mono text-foreground">{record.genesisTx}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Wallet Pengrajin
                </p>
                <p className="mt-0.5 font-mono text-foreground">
                  {truncateAddress(record.provenance[0]?.actor ?? "")}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Pemilik Saat Ini
                </p>
                <p className="mt-0.5 font-mono text-verified">
                  {truncateAddress(record.currentOwner)}
                </p>
              </div>
            </div>

            <ProvenanceTimeline record={record} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VerificationNotFound({ query }: { query: string }) {
  return (
    <Card className="border-destructive/40 bg-card">
      <CardContent className="flex items-start gap-4 p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
          <TriangleAlert className="h-5 w-5 text-destructive" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-destructive">
            Sertifikat tidak ditemukan
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tidak ada catatan blockchain untuk{" "}
            <span className="font-mono text-foreground">{query}</span>. Periksa kembali Wayang ID /
            IPFS CID, atau coba contoh ID di bawah.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
