import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VerificationNotFound, VerificationResult } from "@/components/VerificationResult";
import { useWayang } from "@/components/WayangProvider";
import type { WayangRecord } from "@/lib/wayangStore";
import { QrCode, ScanLine, Search, ShieldCheck, Hammer, Store, Gem, Camera } from "lucide-react";
import heroImg from "@/assets/wayang-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "WayangChain — Verifikasi Keaslian Wayang Kulit di Blockchain",
      },
      {
        name: "description",
        content:
          "Verifikasi keaslian dan telusuri jejak kepemilikan wayang kulit secara terdesentralisasi. Cari Sertifikat Wayang ID atau IPFS CID tanpa perlu wallet.",
      },
      { property: "og:title", content: "WayangChain — Verifikasi Keaslian Wayang Kulit" },
      {
        property: "og:description",
        content:
          "Sertifikat keaslian & jejak kepemilikan wayang kulit terdesentralisasi. Verifikasi publik tanpa wallet, operasi tulis via Phantom.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicVerifier,
});

const EXAMPLES = ["WC-SOLO-0001", "WC-YOG-0007", "WC-JKT-0042"];

function PublicVerifier() {
  const { registry, verify } = useWayang();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<WayangRecord | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const runSearch = (value: string) => {
    const found = verify(value);
    if (found) {
      setResult(found);
      setMiss(null);
    } else {
      setResult(null);
      setMiss(value);
    }
  };

  const simulateScan = () => {
    setScanning(true);
    setResult(null);
    setMiss(null);
    // Mock camera: after a short "focus", resolve a seeded certificate.
    setTimeout(() => {
      const target = registry[Math.floor(Math.random() * registry.length)];
      if (!target) {
        setScanning(false);
        return;
      }
      setScanning(false);
      setQuery(target.id);
      runSearch(target.id);
    }, 1400);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Pertunjukan wayang kulit dengan jaringan blockchain"
          width={1600}
          height={912}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge variant="outline" className="hairline-gold mb-5 gap-2 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Read-Only Public Verification — tanpa wallet
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">
              <span className="text-gradient-gold">WayangChain:</span>{" "}
              <span className="text-foreground">
                Sertifikat Keaslian &amp; Jejak Kepemilikan Wayang Kulit Terdesentralisasi
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Setiap wayang kulit memiliki Genesis Block yang dicetak pengrajin, jejak lokasi galeri,
              dan riwayat kepemilikan yang tersimpan permanen di blockchain — diverifikasi langsung
              dari metadata on-chain.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 md:grid-cols-[1fr_320px]"
        >
          {/* Search */}
          <Card className="border-primary/25 bg-card/90">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Verifikasi Sertifikat</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Masukkan Wayang ID atau IPFS CID Hash. Tidak perlu menghubungkan wallet.
              </p>
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch(query);
                }}
              >
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="cth. WC-SOLO-0001 atau ipfs://QmX8z7…"
                  className="font-mono text-sm"
                />
                <Button type="submit" className="shrink-0 gap-2 glow-gold">
                  <Search className="h-4 w-4" /> Verifikasi
                </Button>
              </form>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                Contoh ID:
                {EXAMPLES.map((id) => (
                  <button
                    key={id}
                    className="rounded-full border border-primary/25 px-2.5 py-0.5 font-mono text-[11px] text-gold-soft transition-colors hover:bg-accent"
                    onClick={() => {
                      setQuery(id);
                      runSearch(id);
                    }}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive camera QR scanner mockup */}
          <Card className="border-primary/25 bg-card/90">
            <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/40 bg-secondary/50">
                <div className="absolute inset-6 rounded-lg border border-dashed border-verified/50 opacity-60" />
                {scanning && (
                  <motion.div
                    className="absolute left-4 right-4 h-0.5 bg-verified shadow-[0_0_12px_var(--verified)]"
                    animate={{ top: ["20%", "78%", "20%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <QrCode className="h-16 w-16 text-primary/70" />
              </div>
              <div>
                <p className="flex items-center justify-center gap-1.5 text-sm font-medium">
                  <Camera className="h-4 w-4 text-verified" /> Interactive Camera QR Scanner
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mockup kamera — pindai QR sertifikat fisik wayang.
                </p>
              </div>
              <Button variant="secondary" className="gap-2" onClick={simulateScan} disabled={scanning}>
                <ScanLine className="h-4 w-4" />
                {scanning ? "Memindai…" : "Simulasi Scan QR"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result */}
        <div className="mt-8 space-y-6">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <VerificationResult record={result} />
              </motion.div>
            )}
            {miss && !result && (
              <motion.div
                key="miss"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <VerificationNotFound query={miss} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-primary/10 bg-secondary/20 py-14">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display mb-8 text-center text-2xl font-bold">
            Bagaimana <span className="text-gradient-gold">rantainya</span> bekerja
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Hammer,
                title: "Genesis Block — Pengrajin",
                desc: "Pengrajin mendaftarkan wayang & sertifikat kayu ke blockchain, ditandatangani via Phantom.",
              },
              {
                icon: Store,
                title: "Gallery Hub — Penyalur",
                desc: "Galeri memperbarui lokasi fisik & status penjualan, setiap langkah terekam on-chain.",
              },
              {
                icon: Gem,
                title: "Collector — Kolektor",
                desc: "Transfer kepemilikan terjadi on-chain, riwayat provenance tidak dapat diubah.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-primary/15 bg-card/70">
                <CardContent className="space-y-3 p-6">
                  <span className="hairline-gold flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <h3 className="font-display text-base font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
