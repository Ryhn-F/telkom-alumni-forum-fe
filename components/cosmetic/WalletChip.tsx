"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";

function formatBalance(balance: number): string {
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1).replace(/\.0$/, "")}rb`;
  }
  return balance.toLocaleString("id-ID");
}

export function WalletChip() {
  const { balance, refetch } = useWalletStore();

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Link
      href="/wallet"
      className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition-colors"
      title="Tel-Credits"
    >
      <Coins className="h-3.5 w-3.5" />
      <span>{balance === null ? "…" : formatBalance(balance)}</span>
    </Link>
  );
}
