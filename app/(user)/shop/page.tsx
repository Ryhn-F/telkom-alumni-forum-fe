"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Check, Lock, Eye, EyeOff, X } from "lucide-react";
import { CosmeticAvatar } from "@/components/cosmetic/CosmeticAvatar";
import { ProfileBanner } from "@/components/cosmetic/ProfileBanner";
import { ThreadBgTint } from "@/components/cosmetic/ThreadBgTint";
import {
  equipCosmetic,
  getCatalog,
  getInventory,
  getUserCosmetics,
  purchaseCosmetic,
  unequipCosmetic,
} from "@/lib/cosmetic";
import { useAuthStore } from "@/stores";
import { useWalletStore } from "@/stores/wallet-store";
import type { Cosmetic, CosmeticSlot, InventoryItem, UserEquip } from "@/types";

const SLOT_LABEL: Record<CosmeticSlot, string> = {
  avatar_border: "Bingkai Avatar",
  thread_bg: "Latar Thread",
  profile_bg: "Latar Profil",
};

function CosmeticPreview({ cosmetic }: { cosmetic: Cosmetic }) {
  if (cosmetic.slot === "avatar_border") {
    return (
      <div className="flex items-center justify-center h-20">
        <CosmeticAvatar avatarUrl={undefined} username="?" size={56} border={cosmetic} />
      </div>
    );
  }
  if (cosmetic.slot === "profile_bg") {
    return (
      <div className="h-20 rounded-lg overflow-hidden">
        <ProfileBanner cosmetic={cosmetic} />
      </div>
    );
  }
  // thread_bg preview: render the actual tint/gradient against sample text,
  // same component used on real cards — not a placeholder label.
  return (
    <div className="relative h-20 rounded-lg border border-border/60 bg-card overflow-hidden px-3 flex flex-col justify-center">
      <ThreadBgTint cosmetic={cosmetic} />
      <p className="relative z-[1] text-[11px] text-foreground/90 leading-snug line-clamp-2">
        Contoh isi thread kamu bakal kelihatan begini.
      </p>
      <p className="relative z-[1] text-[10px] text-muted-foreground mt-1">fardhan · 2j lalu</p>
    </div>
  );
}

function CatalogCard({
  cosmetic,
  owned,
  equipped,
  balance,
  onChange,
  isPreviewing,
  onTogglePreview,
}: {
  cosmetic: Cosmetic;
  owned: boolean;
  equipped: boolean;
  balance: number | null;
  onChange: () => void;
  isPreviewing: boolean;
  onTogglePreview: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const refetchWallet = useWalletStore((s) => s.refetch);
  const canAfford = balance !== null && balance >= cosmetic.price;

  const handlePurchase = async () => {
    setBusy(true);
    try {
      await purchaseCosmetic(cosmetic.id);
      toast.success(`${cosmetic.name} berhasil dibeli!`);
      await refetchWallet();
      onChange();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } };
      const data = error.response?.data;
      toast.error(data?.message || "Gagal membeli kosmetik");
    } finally {
      setBusy(false);
    }
  };

  const handleEquipToggle = async () => {
    setBusy(true);
    try {
      if (equipped) {
        await unequipCosmetic(cosmetic.slot);
        toast.success("Dilepas");
      } else {
        await equipCosmetic(cosmetic.slot, cosmetic.id);
        toast.success("Dipakai!");
      }
      onChange();
    } catch {
      toast.error("Gagal memperbarui kosmetik yang dipakai");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${isPreviewing ? "ring-2 ring-primary" : ""}`}>
      <div className="relative">
        <CosmeticPreview cosmetic={cosmetic} />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full"
          onClick={onTogglePreview}
          title={isPreviewing ? "Berhenti mencoba" : "Coba dulu di avatar/profil kamu"}
        >
          {isPreviewing ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug">{cosmetic.name}</p>
          {cosmetic.min_rank && (
            <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
              <Lock className="h-2.5 w-2.5" />
              {cosmetic.min_rank}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-400 border-amber-500/30">
            <Coins className="h-3 w-3" />
            {cosmetic.price} TC
          </Badge>
          {owned ? (
            <Button size="sm" variant={equipped ? "secondary" : "outline"} disabled={busy} onClick={handleEquipToggle}>
              {equipped ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" /> Dipakai
                </>
              ) : (
                "Pakai"
              )}
            </Button>
          ) : (
            <Button size="sm" disabled={busy || !canAfford} onClick={handlePurchase}>
              Beli
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TryOnPanel({ cosmetic, avatarUrl, username, onClose }: {
  cosmetic: Cosmetic;
  avatarUrl?: string | null;
  username: string;
  onClose: () => void;
}) {
  return (
    <Card className="border-primary/40 bg-primary/[0.03]">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-4">
          {cosmetic.slot === "avatar_border" && (
            <CosmeticAvatar avatarUrl={avatarUrl} username={username} size={64} border={cosmetic} />
          )}
          {cosmetic.slot === "profile_bg" && (
            <div className="w-40 rounded-lg overflow-hidden shrink-0">
              <ProfileBanner cosmetic={cosmetic} />
            </div>
          )}
          {cosmetic.slot === "thread_bg" && (
            <div className="relative w-40 h-16 rounded-xl overflow-hidden border border-border/60 bg-card shrink-0 flex items-center px-3">
              <ThreadBgTint cosmetic={cosmetic} />
              <p className="relative text-[11px] text-foreground/90 leading-snug">
                Contoh isi thread kamu bakal kelihatan begini.
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">Pratinjau: {cosmetic.name}</p>
            <p className="text-xs text-muted-foreground">
              Cuma tampilan sementara di layar kamu — belum dibeli, belum tersimpan.
            </p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ShopPage() {
  const user = useAuthStore((s) => s.user);
  const balance = useWalletStore((s) => s.balance);
  const refetchWallet = useWalletStore((s) => s.refetch);

  const [catalog, setCatalog] = useState<Cosmetic[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equip, setEquip] = useState<UserEquip | null>(null);
  const [loading, setLoading] = useState(true);
  const [slot, setSlot] = useState<CosmeticSlot>("avatar_border");
  const [previewing, setPreviewing] = useState<Cosmetic | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [catalogRes, inventoryRes, equipRes] = await Promise.all([
        getCatalog(),
        getInventory(),
        user ? getUserCosmetics(user.username) : Promise.resolve(null),
      ]);
      setCatalog(catalogRes);
      setInventory(inventoryRes);
      setEquip(equipRes);
    } catch {
      toast.error("Gagal memuat toko");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
    refetchWallet();
  }, [loadAll, refetchWallet]);

  const ownedIds = new Set(inventory.map((i) => i.cosmetic.id));
  const equippedIds = new Set(
    [equip?.avatar_border?.id, equip?.thread_bg?.id, equip?.profile_bg?.id].filter(
      (id): id is number => typeof id === "number"
    )
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = catalog.filter((c) => c.slot === slot);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Toko Kosmetik</h1>
        <p className="text-sm text-muted-foreground">
          Belanjakan Tel-Credits (TC) hasil misi buat bingkai avatar, latar thread, dan latar profil.
        </p>
      </div>

      {previewing && (
        <TryOnPanel
          cosmetic={previewing}
          avatarUrl={user?.avatar_url}
          username={user?.username || "kamu"}
          onClose={() => setPreviewing(null)}
        />
      )}

      <Tabs
        value={slot}
        onValueChange={(v) => {
          setSlot(v as CosmeticSlot);
          setPreviewing(null);
        }}
      >
        <TabsList>
          {(Object.keys(SLOT_LABEL) as CosmeticSlot[]).map((s) => (
            <TabsTrigger key={s} value={s}>
              {SLOT_LABEL[s]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={slot}>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada kosmetik untuk slot ini.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {filtered.map((c) => (
                <CatalogCard
                  key={c.id}
                  cosmetic={c}
                  owned={ownedIds.has(c.id)}
                  equipped={equippedIds.has(c.id)}
                  balance={balance}
                  onChange={loadAll}
                  isPreviewing={previewing?.id === c.id}
                  onTogglePreview={() => setPreviewing(previewing?.id === c.id ? null : c)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
