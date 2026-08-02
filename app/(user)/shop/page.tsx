"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Check, Lock } from "lucide-react";
import { CosmeticAvatar } from "@/components/cosmetic/CosmeticAvatar";
import { ProfileBanner } from "@/components/cosmetic/ProfileBanner";
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
  // thread_bg preview: show the tint against sample card content
  const preset =
    cosmetic.render_type === "css" && "preset_key" in cosmetic.payload
      ? cosmetic.payload.preset_key
      : null;
  return (
    <div className="h-20 rounded-lg border border-border/60 bg-card flex items-center justify-center text-xs text-muted-foreground">
      {preset ? `Tint: ${preset}` : "Latar thread"}
    </div>
  );
}

function CatalogCard({
  cosmetic,
  owned,
  equipped,
  balance,
  onChange,
}: {
  cosmetic: Cosmetic;
  owned: boolean;
  equipped: boolean;
  balance: number | null;
  onChange: () => void;
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
    <Card className="overflow-hidden">
      <CosmeticPreview cosmetic={cosmetic} />
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

export default function ShopPage() {
  const user = useAuthStore((s) => s.user);
  const balance = useWalletStore((s) => s.balance);
  const refetchWallet = useWalletStore((s) => s.refetch);

  const [catalog, setCatalog] = useState<Cosmetic[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equip, setEquip] = useState<UserEquip | null>(null);
  const [loading, setLoading] = useState(true);
  const [slot, setSlot] = useState<CosmeticSlot>("avatar_border");

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

      <Tabs value={slot} onValueChange={(v) => setSlot(v as CosmeticSlot)}>
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
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
