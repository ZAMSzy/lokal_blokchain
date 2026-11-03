import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Gem, Hammer, Search, Store, Wallet, Loader2, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWayang } from "@/components/WayangProvider";
import { NETWORK_LABEL, truncateAddress } from "@/lib/web3Service";

const ROLE_TABS = [
  { to: "/", label: "Public Verifier", icon: Search },
  { to: "/artisan", label: "Artisan", icon: Hammer },
  { to: "/gallery", label: "Gallery", icon: Store },
  { to: "/collector", label: "Collector", icon: Gem },
] as const;

/** Stylized wayang eye + node graphic for the logo mark. */
function WayangMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="wc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E3B2" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8a6d1f" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 L43 13 V35 L24 46 L5 35 V13 Z"
        fill="none"
        stroke="url(#wc-gold)"
        strokeWidth="2"
      />
      <path
        d="M14 20 C20 12, 30 12, 34 19 C30 24, 20 25, 14 20 Z"
        fill="url(#wc-gold)"
      />
      <circle cx="25.5" cy="18.5" r="2.2" fill="#1A1A1A" />
      <path d="M17 29 C21 34, 28 34, 32 29" fill="none" stroke="url(#wc-gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AppHeader() {
  const { session, walletsDetected, connect, connectDemo, disconnect } = useWayang();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleConnect = async (kind: "solana" | "evm") => {
    setConnecting(kind);
    setError(null);
    try {
      await connect(kind);
      setDialogOpen(false);
    } catch {
      setError("Phantom tidak terdeteksi di browser ini. Gunakan mode demo di bawah untuk mencoba alurnya.");
    } finally {
      setConnecting(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/15 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <WayangMark />
          <span className="font-display text-lg font-bold tracking-wide text-gradient-gold">
            WayangChain
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {ROLE_TABS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {session ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hairline-gold gap-2">
                  <span className="h-2 w-2 rounded-full bg-verified shadow-[0_0_8px_var(--verified)]" />
                  <span className="font-mono text-xs">{truncateAddress(session.address)}</span>
                  <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
                    {NETWORK_LABEL[session.network]}
                  </Badge>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm border-primary/25">
                <DialogHeader>
                  <DialogTitle className="font-display flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-verified" /> Wallet terhubung
                  </DialogTitle>
                  <DialogDescription>
                    {session.simulated
                      ? "Mode demo — transaksi ditandatangani lewat simulasi Phantom."
                      : "Terhubung ke ekstensi Phantom asli di browser Anda."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-primary/20 bg-secondary/40 p-3">
                    <p className="text-xs text-muted-foreground">Alamat wallet</p>
                    <p className="mt-1 break-all font-mono text-xs text-foreground">{session.address}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Jaringan: {NETWORK_LABEL[session.network]} • {session.provider === "solana" ? "Solana Adapter" : "EVM Web3Provider"}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => {
                      disconnect();
                      setDialogOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Putuskan dompet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 glow-gold" onClick={() => setError(null)}>
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Connect Phantom Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md border-primary/25">
                <DialogHeader>
                  <DialogTitle className="font-display">Hubungkan Phantom Wallet</DialogTitle>
                  <DialogDescription>
                    Operasi baca (verifikasi publik) tidak butuh dompet. Dompet hanya wajib untuk
                    mint, update lokasi, dan transfer kepemilikan.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2.5">
                  <button
                    className="flex w-full items-center justify-between rounded-xl border border-primary/25 bg-secondary/40 p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent"
                    onClick={() => handleConnect("solana")}
                    disabled={connecting !== null}
                  >
                    <span>
                      <span className="block text-sm font-medium">Phantom — Solana</span>
                      <span className="text-xs text-muted-foreground">
                        {walletsDetected.solana
                          ? "Terdeteksi • window.phantom.solana"
                          : "Belum terdeteksi di browser ini"}
                      </span>
                    </span>
                    {connecting === "solana" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Wallet className="h-5 w-5 text-primary" />
                    )}
                  </button>
                  <button
                    className="flex w-full items-center justify-between rounded-xl border border-primary/25 bg-secondary/40 p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent"
                    onClick={() => handleConnect("evm")}
                    disabled={connecting !== null}
                  >
                    <span>
                      <span className="block text-sm font-medium">Phantom — EVM Multi-chain</span>
                      <span className="text-xs text-muted-foreground">
                        {walletsDetected.evm
                          ? "Terdeteksi • window.ethereum (Phantom)"
                          : "Belum terdeteksi di browser ini"}
                      </span>
                    </span>
                    {connecting === "evm" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Wallet className="h-5 w-5 text-primary" />
                    )}
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Mode demo
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tanpa ekstensi Phantom? Pakai dompet simulasi untuk mencoba seluruh alur
                    (Localnet).
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        connectDemo("solana");
                        setDialogOpen(false);
                      }}
                    >
                      Dompet Demo Solana
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        connectDemo("evm");
                        setDialogOpen(false);
                      }}
                    >
                      Dompet Demo EVM
                    </Button>
                  </div>
                  {error && (
                    <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive-foreground">
                      {error}
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Mobile role tabs */}
      <nav className="flex items-center justify-between gap-1 overflow-x-auto border-t border-primary/10 px-3 py-1.5 md:hidden">
        {ROLE_TABS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors"
            activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}
            onClick={() => navigate({ to })}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
