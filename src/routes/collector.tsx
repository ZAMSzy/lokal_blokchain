import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WalletNotice } from "@/components/WalletNotice";
import { useWayang } from "@/components/WayangProvider";
import { RECORD_IMAGES, DEMO_ROLES, type WayangRecord } from "@/lib/wayangStore";
import { truncateAddress } from "@/lib/web3Service";
import { Gem, KeyRound, Loader2, PackageOpen } from "lucide-react";

export const Route = createFileRoute("/collector")({
  head: () => ({
    meta: [
      { title: "Collector Dashboard — Koleksi & Transfer Kepemilikan | WayangChain" },
      {
        name: "description",
        content:
          "Dashboard kolektor: kelola koleksi wayang kulit dan transfer kepemilikan on-chain, ditandatangani via Phantom Wallet.",
      },
      { property: "og:title", content: "Collector Dashboard — WayangChain" },
      {
        property: "og:description",
        content: "Koleksi wayang saya dan transfer kepemilikan on-chain via Phantom Wallet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectorDashboard,
});

function CollectorDashboard() {
  const { session, myRecords, registry, transfer } = useWayang();
  const [transferTarget, setTransferTarget] = useState<WayangRecord | null>(null);
  const [newOwner, setNewOwner] = useState<string>(DEMO_ROLES.collector.address);
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="px-4 py-14">
        <WalletNotice portal="Collector Dashboard (Pemilik Wayang)" />
      </div>
    );
  }

  const handleTransfer = async () => {
    if (!transferTarget || !newOwner.trim()) return;
    setSubmitting(true);
    try {
      await transfer(transferTarget.id, newOwner.trim());
      setTransferTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient-gold">Collector Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pemilik Wayang • Koleksi tervalidasi per alamat Phantom Wallet
            </p>
          </div>
          <Badge variant="outline" className="hairline-gold gap-2 py-1.5">
            <span className="h-2 w-2 rounded-full bg-verified" />
            <span className="font-mono text-[11px]">{truncateAddress(session.address)}</span>
          </Badge>
        </div>

        <h2 className="font-display mb-4 text-lg font-semibold">
          Koleksi Wayang Saya{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({myRecords.length} item on-chain)
          </span>
        </h2>

        {myRecords.length === 0 ? (
          <Card className="border-dashed border-primary/25 bg-card/60">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <PackageOpen className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Dompet ini belum memiliki wayang terdaftar. Coba dompet demo kolektor (
                <span className="font-mono text-xs">{truncateAddress(DEMO_ROLES.collector.address)}</span>
                ) untuk melihat koleksi contoh, atau transfer salah satu item dari tabel registry
                ke dompet ini lewat hub galeri.
              </p>
              <p className="text-xs text-muted-foreground">
                Total {registry.length} sertifikat terdaftar di jaringan.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myRecords.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full overflow-hidden border-primary/25 bg-card">
                  <CardContent className="flex h-full flex-col p-0">
                    <div className="relative">
                      <img
                        src={RECORD_IMAGES[r.imageKey]}
                        alt={r.tokoh}
                        width={320}
                        height={240}
                        loading="lazy"
                        className="h-52 w-full object-cover"
                      />
                      <Badge className="absolute left-3 top-3 bg-verified text-verified-foreground glow-verified">
                        <Gem className="mr-1 h-3 w-3" /> ON CHAIN
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div>
                        <h3 className="font-display text-base font-semibold text-gradient-gold">
                          {r.tokoh}
                        </h3>
                        <p className="font-mono text-[11px] text-muted-foreground">{r.id}</p>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          <span className="text-foreground">{r.pengrajin}</span> • {r.asal}
                        </p>
                        <p>Status: {r.status}</p>
                        <p className="font-mono">{truncateAddress(r.currentOwner)}</p>
                      </div>
                      <Button
                        className="mt-auto gap-2"
                        variant="secondary"
                        onClick={() => {
                          setTransferTarget(r);
                          setNewOwner(DEMO_ROLES.collector.address);
                        }}
                      >
                        <KeyRound className="h-4 w-4" /> Transfer Kepemilikan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Transfer modal */}
      <Dialog open={!!transferTarget} onOpenChange={(open) => !open && setTransferTarget(null)}>
        <DialogContent className="max-w-md border-primary/25">
          <DialogHeader>
            <DialogTitle className="font-display">Transfer Kepemilikan</DialogTitle>
            <DialogDescription>
              {transferTarget
                ? `${transferTarget.tokoh} (${transferTarget.id}) akan berpindah ke alamat wallet baru. Transaksi ditandatangani via Phantom.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Alamat Wallet Pembeli Baru</Label>
              <Input
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="font-mono text-xs"
                placeholder="7X9z… atau 0x7a2…"
              />
            </div>
            <Button
              className="w-full gap-2 glow-gold"
              disabled={!newOwner.trim() || !isLikelyAddress(newOwner) || submitting}
              onClick={handleTransfer}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menunggu tanda tangan Phantom…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" /> Exec Transfer (Sign via Phantom)
                </>
              )}
            </Button>
            {newOwner.trim() && !isLikelyAddress(newOwner) && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs">
                Alamat wallet tidak valid — gunakan alamat Solana (base58) atau EVM (0x…).
              </p>
            )}


          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function isLikelyAddress(value: string): boolean {
  const v = value.trim();
  return v.startsWith("0x") ? v.length >= 10 : v.length >= 32;
}
