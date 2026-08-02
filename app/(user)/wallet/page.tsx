"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Store, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getTransactions } from "@/lib/wallet";
import { useWalletStore } from "@/stores/wallet-store";
import type { WalletTransaction } from "@/types";

const SOURCE_LABEL: Record<string, string> = {
  mission_claim: "Klaim misi",
  purchase: "Beli kosmetik",
  admin_grant: "Hadiah admin",
  correction: "Koreksi",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isCredit = tx.amount > 0;
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
            isCredit ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
          }`}
        >
          {isCredit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {SOURCE_LABEL[tx.source_type] || tx.source_type}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${isCredit ? "text-emerald-600" : "text-red-600"}`}>
          {isCredit ? "+" : ""}
          {tx.amount} TC
        </p>
        <p className="text-xs text-muted-foreground">Saldo: {tx.balance_after} TC</p>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function WalletPage() {
  const { balance, refetch } = useWalletStore();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadMore = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getTransactions(PAGE_SIZE, currentOffset);
      setTransactions((prev) => (reset ? res.data : [...prev, ...res.data]));
      setHasMore(res.data.length === PAGE_SIZE);
      setOffset(currentOffset + res.data.length);
    } catch {
      toast.error("Gagal memuat riwayat transaksi");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    refetch();
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Dompet Tel-Credits</h1>
        <p className="text-sm text-muted-foreground">Saldo dan riwayat transaksi TC kamu.</p>
      </div>

      <Card className="overflow-hidden border-amber-500/30">
        <CardContent className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo saat ini</p>
              <p className="text-2xl font-bold">
                {balance === null ? "…" : balance.toLocaleString("id-ID")} TC
              </p>
            </div>
          </div>
          <Link href="/shop">
            <Button size="sm" className="gap-1.5">
              <Store className="h-3.5 w-3.5" />
              Ke Toko
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada transaksi. Selesaikan misi buat mulai dapat TC!
            </p>
          ) : (
            <>
              <div>
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" size="sm" disabled={loadingMore} onClick={() => loadMore(false)}>
                    {loadingMore ? "Memuat..." : "Muat lebih banyak"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {balance !== null && (
        <Badge variant="outline" className="text-xs">
          Format tampilan angka bisa berbeda di tempat lain (mis. header ringkas) — ini saldo penuh.
        </Badge>
      )}
    </div>
  );
}
