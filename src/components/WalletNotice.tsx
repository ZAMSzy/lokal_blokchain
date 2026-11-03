import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWayang } from "@/components/WayangProvider";
import { Wallet } from "lucide-react";

/** Shown on write-portal pages when no wallet session exists. */
export function WalletNotice({ portal }: { portal: string }) {
  const { connectDemo, connect, walletsDetected } = useWayang();

  return (
    <Card className="mx-auto max-w-xl border-primary/30 bg-card">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <span className="glow-gold flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-7 w-7 text-primary" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-gradient-gold">Dompet Diperlukan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {portal} memerlukan koneksi Phantom Wallet. Klik tombol{" "}
            <span className="font-medium text-foreground">"Connect Phantom Wallet"</span> di kanan
            atas, atau gunakan dompet demo untuk mencoba alurnya.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            className="gap-2"
            onClick={() => {
              connect("solana").catch(() => connectDemo("solana"));
            }}
          >
            <Wallet className="h-4 w-4" />
            {walletsDetected.solana ? "Hubungkan Phantom Solana" : "Coba Phantom (fallback demo)"}
          </Button>
          <Button variant="secondary" onClick={() => connectDemo("collector")}>
            Langsung pakai Dompet Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
