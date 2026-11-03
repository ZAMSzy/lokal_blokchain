import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { WalletNotice } from "@/components/WalletNotice";
import { useWayang } from "@/components/WayangProvider";
import type { WayangRecord } from "@/lib/wayangStore";
import { generateIpfsCid, truncateAddress } from "@/lib/web3Service";
import { Hammer, FileUp, Printer, BadgeCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/artisan")({
  head: () => ({
    meta: [
      { title: "Artisan Portal — Mint Genesis Block | WayangChain" },
      {
        name: "description",
        content:
          "Portal pengrajin wayang kulit: daftarkan karya dan cetak Genesis Block sertifikat keaslian, ditandatangani via Phantom Wallet.",
      },
      { property: "og:title", content: "Artisan Portal — WayangChain" },
      {
        property: "og:description",
        content: "Mint Genesis Block sertifikat keaslian wayang kulit via Phantom Wallet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArtisanPortal,
});

function ArtisanPortal() {
  const { session, mint } = useWayang();
  const [form, setForm] = useState({
    tokoh: "",
    gaya: "Gaya Sungging Solo (Surakarta)",
    bahanKulit: "Kulit Sapi Prambanan, tebal 0.5 mm",
    tanggalSelesai: "",
    harga: "",
    asal: "Solo, Surakarta",
    pengrajin: "",
  });
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [fileCid, setFileCid] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState<WayangRecord | null>(null);

  if (!session) {
    return (
      <div className="px-4 py-14">
        <WalletNotice portal="Artisan Portal (Pengrajin Wayang)" />
      </div>
    );
  }

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const name = files[0].name;
    setUploadName(name);
    // Simulated IPFS pinning of the photo + physical wooden certificate.
    setFileCid(`ipfs://${generateIpfsCid()}`);
  };

  const handleMint = async () => {
    setMinting(true);
    try {
      const record = await mint({ ...form }, "arjuna", fileCid ?? undefined);
      setMinted(record);
    } finally {
      setMinting(false);
    }
  };

  const valid = form.tokoh.trim() && form.tanggalSelesai.trim() && form.harga.trim() && form.pengrajin.trim();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient-gold">Artisan Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pengrajin Wayang • Mint Genesis Block dengan tanda tangan Phantom Wallet
            </p>
          </div>
          <Badge variant="outline" className="hairline-gold gap-2 py-1.5">
            <span className="h-2 w-2 rounded-full bg-verified" />
            <span className="font-mono text-[11px]">{truncateAddress(session.address)}</span>
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Registration form */}
          <Card className="border-primary/25 bg-card">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <Hammer className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Registrasi Wayang Baru</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Tokoh Wayang</Label>
                  <Input
                    value={form.tokoh}
                    onChange={(e) => set("tokoh")(e.target.value)}
                    placeholder='cth. "Arjuna Sungging Solo"'
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gaya Sungging</Label>
                  <Select value={form.gaya} onValueChange={set("gaya")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gaya Sungging Solo (Surakarta)">Gaya Sungging Solo (Surakarta)</SelectItem>
                      <SelectItem value="Gaya Kraton Yogyakarta">Gaya Kraton Yogyakarta</SelectItem>
                      <SelectItem value="Gaya Sungging Pantura">Gaya Sungging Pantura</SelectItem>
                      <SelectItem value="Gaya Cirebon">Gaya Cirebon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Bahan Kulit</Label>
                  <Input value={form.bahanKulit} onChange={(e) => set("bahanKulit")(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal Selesai</Label>
                  <Input
                    type="date"
                    value={form.tanggalSelesai}
                    onChange={(e) => set("tanggalSelesai")(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Harga</Label>
                  <Input
                    value={form.harga}
                    onChange={(e) => set("harga")(e.target.value)}
                    placeholder="Rp 4.500.000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tempat Asal</Label>
                  <Input value={form.asal} onChange={(e) => set("asal")(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nama Pengrajin</Label>
                  <Input
                    value={form.pengrajin}
                    onChange={(e) => set("pengrajin")(e.target.value)}
                    placeholder="cth. Ki Slamet Raharjo"
                  />
                </div>
              </div>

              {/* Upload zone */}
              <div>
                <Label>Upload Foto Wayang &amp; Sertifikat Kayu Fisik</Label>
                <label
                  className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-secondary/30 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-accent/40"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleUpload(e.dataTransfer.files);
                  }}
                >
                  <FileUp className="h-7 w-7 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Tarik &amp; lepas file di sini, atau klik untuk memilih foto
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    JPG/PNG — otomatis di-pin ke IPFS (simulasi)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </label>
                {uploadName && (
                  <p className="mt-2 rounded-lg border border-verified/30 bg-verified/10 px-3 py-2 text-xs">
                    <span className="font-medium text-verified">{uploadName}</span>
                    <span className="text-muted-foreground"> → CID: </span>
                    <span className="font-mono text-foreground">{fileCid}</span>
                  </p>
                )}
              </div>

              <Separator className="bg-primary/15" />

              <Button
                className="w-full gap-2 glow-gold"
                size="lg"
                disabled={!valid || minting}
                onClick={handleMint}
              >
                {minting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menunggu tanda tangan Phantom…
                  </>
                ) : (
                  <>
                    <BadgeCheck className="h-5 w-5" /> Mint Genesis Block (Sign via Phantom)
                  </>
                )}
              </Button>
              {!valid && (
                <p className="text-center text-xs text-muted-foreground">
                  Lengkapi tokoh, tanggal selesai, harga, dan nama pengrajin untuk mengaktifkan mint.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Certificate preview / result */}
          <div>
            {minted ? (
              <PrintableCertificate record={minted} />
            ) : (
              <Card className="border-primary/15 bg-card/60">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  <h3 className="font-display mb-2 text-base font-semibold text-foreground">
                    Sertifikat Otomatis
                  </h3>
                  Setelah mint berhasil, sertifikat keaslian digital lengkap dengan QR Code akan
                  tercetak di panel ini — siap dicetak dan disematkan pada wayang.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PrintableCertificate({ record }: { record: WayangRecord }) {
  return (
    <Card className="print-certificate border-primary/40 bg-card glow-gold">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold-soft">WayangChain</p>
            <h3 className="font-display text-lg font-bold text-gradient-gold">
              Sertifikat Keaslian Digital
            </h3>
          </div>
          <Badge className="bg-verified text-verified-foreground">GENESIS BLOCK</Badge>
        </div>

        <div className="flex items-center justify-center rounded-xl bg-ivory/0 p-3" style={{ backgroundColor: "#FDFBF7" }}>
          <QRCode
            value={`https://wayangchain.id/verify/${record.id}`}
            size={132}
            bgColor="#FDFBF7"
            fgColor="#1A1A1A"
          />
        </div>

        <dl className="space-y-1.5 text-xs">
          {[
            ["Wayang ID", record.id],
            ["Tokoh", record.tokoh],
            ["Pengrajin", record.pengrajin],
            ["Metadata CID", record.cid],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="truncate font-mono text-foreground">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="text-center text-[11px] text-muted-foreground">
          Pindai QR untuk verifikasi publik — tanpa wallet.
        </p>

        <Button variant="secondary" className="w-full gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Cetak Sertifikat
        </Button>
      </CardContent>
    </Card>
  );
}
