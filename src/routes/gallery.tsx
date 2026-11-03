import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WalletNotice } from "@/components/WalletNotice";
import { useWayang } from "@/components/WayangProvider";
import { RECORD_IMAGES, type WayangRecord } from "@/lib/wayangStore";
import { truncateAddress } from "@/lib/web3Service";
import { QrCode, ScanLine, Store, MapPin, Loader2 } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery & Distributor Hub — Update Location Track | WayangChain" },
      {
        name: "description",
        content:
          "Sanggar dan galeri memperbarui jejak lokasi fisik wayang kulit on-chain, ditandatangani via Phantom Wallet.",
      },
      { property: "og:title", content: "Gallery & Distributor Hub — WayangChain" },
      {
        property: "og:description",
        content: "Update jejak lokasi wayang kulit on-chain via Phantom Wallet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryHub,
});

function GalleryHub() {
  const { session, registry, updateLocation } = useWayang();
  const [target, setTarget] = useState<WayangRecord | null>(null);
  const [lokasi, setLokasi] = useState("Galeri Seni Jogja");
  const [status, setStatus] = useState("Ready for Sale");
  const [submitting, setSubmitting] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  if (!session) {
    return (
      <div className="px-4 py-14">
        <WalletNotice portal="Gallery & Distributor Hub" />
      </div>
    );
  }

  const commitScan = (record: WayangRecord) => {
    setTarget(record);
    setLokasi(record.lokasi.startsWith("Workshop") ? "Galeri Seni Jogja" : record.lokasi);
    setScanOpen(false);
  };

  const handleUpdate = async () => {
    if (!target) return;
    setSubmitting(true);
    try {
      await updateLocation(target.id, lokasi, status);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient-gold">Gallery &amp; Distributor Hub</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Penyalur / Sanggar • Perbarui jejak lokasi fisik on-chain via Phantom
            </p>
          </div>
          <Badge variant="outline" className="hairline-gold gap-2 py-1.5">
            <span className="h-2 w-2 rounded-full bg-verified" />
            <span className="font-mono text-[11px]">{truncateAddress(session.address)}</span>
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Registry table */}
          <Card className="border-primary/25 bg-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Pilih Wayang untuk Update</h2>
                </div>
                <Dialog open={scanOpen} onOpenChange={setScanOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                      <QrCode className="h-4 w-4" /> Scan QR Sertifikat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md border-primary/25">
                    <DialogHeader>
                      <DialogTitle className="font-display">QR Scanner — Simulasi Kamera</DialogTitle>
                      <DialogDescription>
                        Pilih sertifikat yang seolah terpindai kamera untuk memuat datanya.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative mx-auto mb-2 flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-primary/40 bg-secondary/50">
                      <div className="absolute inset-6 rounded-lg border border-dashed border-verified/50" />
                      <QrCode className="h-14 w-14 text-primary/70" />
                    </div>
                    <div className="space-y-1.5">
                      {registry.map((r) => (
                        <button
                          key={r.id}
                          className="flex w-full items-center justify-between rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
                          onClick={() => commitScan(r)}
                        >
                          <span className="flex items-center gap-2">
                            <ScanLine className="h-4 w-4 text-verified" />
                            <span className="font-medium">{r.tokoh}</span>
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto rounded-xl border border-primary/15">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/15 bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5">Wayang</th>
                      <th className="px-4 py-2.5">ID</th>
                      <th className="px-4 py-2.5">Lokasi Saat Ini</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {registry.map((r) => (
                      <tr
                        key={r.id}
                        className={`border-b border-primary/10 last:border-0 transition-colors ${
                          target?.id === r.id ? "bg-accent/50" : "hover:bg-secondary/30"
                        }`}
                      >
                        <td className="px-4 py-2.5 font-medium">{r.tokoh}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{r.id}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.lokasi}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="text-[10px]">
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary"
                            onClick={() => setTarget(r)}
                          >
                            Pilih
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Location update form */}
          <Card className="border-primary/25 bg-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Update Location Track</h2>
              </div>

              {target ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-secondary/40 p-3">
                  <img
                    src={RECORD_IMAGES[target.imageKey]}
                    alt={target.tokoh}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="h-14 w-14 rounded-lg border border-primary/30 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{target.tokoh}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{target.id}</p>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-primary/25 p-4 text-xs text-muted-foreground">
                  Belum ada wayang dipilih — pilih dari tabel atau gunakan QR Scanner.
                </p>
              )}

              <div className="space-y-1.5">
                <Label>Lokasi Fisik Saat Ini</Label>
                <Input value={lokasi} onChange={(e) => setLokasi(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ready for Sale">Galeri — Ready for Sale</SelectItem>
                    <SelectItem value="Dipajang Pameran">Dipajang Pameran</SelectItem>
                    <SelectItem value="Dikirim ke Kolektor">Dikirim ke Kolektor</SelectItem>
                    <SelectItem value="Restorasi">Restorasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full gap-2 glow-gold"
                size="lg"
                disabled={!target || submitting}
                onClick={handleUpdate}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menunggu tanda tangan Phantom…
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" /> Update Location Track (Sign via Phantom)
                  </>
                )}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Setiap pembaruan menambah entri baru di Provenance Timeline wayang.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
