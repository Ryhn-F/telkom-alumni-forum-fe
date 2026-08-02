"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Sparkles } from "lucide-react";
import {
  AdminCosmeticInput,
  adminCreateCosmetic,
  adminListCosmetics,
  adminUpdateCosmetic,
} from "@/lib/cosmetic";
import { CosmeticAvatar } from "@/components/cosmetic/CosmeticAvatar";
import type { Cosmetic, CosmeticRenderType, CosmeticSlot, CosmeticStatus, CosmeticSubType } from "@/types";

const SLOTS: CosmeticSlot[] = ["avatar_border", "thread_bg", "profile_bg"];
const STATUSES: CosmeticStatus[] = ["draft", "published", "retired"];
const RANKS = ["", "Pendatang", "Warga", "Aktivis", "Tokoh", "Sepuh", "Legenda"];

const STATUS_COLOR: Record<CosmeticStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  retired: "bg-red-500/10 text-red-600 border-red-500/30",
};

function emptyForm(): AdminCosmeticInput {
  return {
    slot: "avatar_border",
    render_type: "css",
    name: "",
    price: 0,
    status: "draft",
  };
}

function CosmeticForm({
  value,
  onChange,
}: {
  value: AdminCosmeticInput;
  onChange: (v: AdminCosmeticInput) => void;
}) {
  const isAvatarBorder = value.slot === "avatar_border";
  const isCss = value.render_type === "css";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Slot</Label>
          <Select
            value={value.slot}
            onValueChange={(v) => {
              const slot = v as CosmeticSlot;
              // thread_bg is CSS-only, profile_bg is image-only (per spec);
              // avatar_border can be either depending on sub_type.
              const renderType: CosmeticRenderType =
                slot === "thread_bg" ? "css" : slot === "profile_bg" ? "image" : value.render_type;
              onChange({ ...value, slot, render_type: renderType, sub_type: undefined });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLOTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAvatarBorder && (
          <div className="space-y-1.5">
            <Label>Sub-tipe</Label>
            <Select
              value={value.sub_type || "ring"}
              onValueChange={(v) => {
                const subType = v as CosmeticSubType;
                onChange({ ...value, sub_type: subType, render_type: subType === "ring" ? "css" : "image" });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ring">ring (CSS)</SelectItem>
                <SelectItem value="decoration">decoration (image)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Nama</Label>
        <Input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="mis. Ring Conic Spin"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Harga (TC)</Label>
          <Input
            type="number"
            min={0}
            value={value.price}
            onChange={(e) => onChange({ ...value, price: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Rank minimal (opsional)</Label>
          <Select
            value={value.min_rank || "__none__"}
            onValueChange={(v) => onChange({ ...value, min_rank: v === "__none__" ? undefined : v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Tanpa gate</SelectItem>
              {RANKS.filter(Boolean).map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={value.status || "draft"}
          onValueChange={(v) => onChange({ ...value, status: v as CosmeticStatus })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isCss ? (
        <div className="space-y-1.5">
          <Label>Preset key (CSS)</Label>
          <Input
            value={value.preset_key || ""}
            onChange={(e) => onChange({ ...value, preset_key: e.target.value })}
            placeholder={value.slot === "thread_bg" ? "mis. tint-blue atau gradient-aurora" : "mis. ring-conic-spin"}
          />
          <p className="text-xs text-muted-foreground">
            Harus cocok preset yang terdaftar di kode FE (
            {value.slot === "thread_bg"
              ? "components/cosmetic/thread-bg-presets.ts"
              : "components/cosmetic/cosmetic-rings.css"}
            ).
            {value.slot === "thread_bg" && (
              <>
                {" "}Tint statis: tint-blue, tint-purple, tint-emerald, tint-crimson, tint-teal, tint-amber,
                tint-rose, tint-slate. Gradient bergerak: gradient-aurora, gradient-sunset, gradient-spectrum.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>File animasi</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onChange({ ...value, animated: e.target.files?.[0] })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>File statis (reduced motion)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onChange({ ...value, static: e.target.files?.[0] })}
            />
          </div>
          <p className="text-xs text-muted-foreground col-span-2">
            Untuk edit, biarkan kosong buat tetap pakai file lama.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminCosmeticsPage() {
  const [items, setItems] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Cosmetic | null>(null);
  const [form, setForm] = useState<AdminCosmeticInput>(emptyForm());

  const load = async () => {
    try {
      setItems(await adminListCosmetics());
    } catch {
      toast.error("Gagal memuat katalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      await adminCreateCosmetic(form);
      toast.success("Kosmetik berhasil dibuat");
      setIsCreateOpen(false);
      setForm(emptyForm());
      load();
    } catch {
      toast.error("Gagal membuat kosmetik");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (item: Cosmetic) => {
    setEditing(item);
    setForm({
      slot: item.slot,
      sub_type: item.sub_type,
      render_type: item.render_type,
      name: item.name,
      price: item.price,
      min_rank: item.min_rank,
      status: item.status,
      preset_key: "preset_key" in item.payload ? item.payload.preset_key : undefined,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      await adminUpdateCosmetic(editing.id, form);
      toast.success("Kosmetik berhasil diperbarui");
      setEditing(null);
      load();
    } catch {
      toast.error("Gagal memperbarui kosmetik");
    } finally {
      setSubmitting(false);
    }
  };

  const quickStatusChange = async (item: Cosmetic, status: CosmeticStatus) => {
    try {
      await adminUpdateCosmetic(item.id, {
        slot: item.slot,
        sub_type: item.sub_type,
        render_type: item.render_type,
        name: item.name,
        price: item.price,
        min_rank: item.min_rank,
        status,
        preset_key: "preset_key" in item.payload ? item.payload.preset_key : undefined,
      });
      toast.success(`Status diubah ke ${status}`);
      load();
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Kosmetik</h1>
          <p className="text-muted-foreground">
            Katalog ring, dekorasi avatar, latar thread, dan latar profil.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (open) setForm(emptyForm()); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Kosmetik
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Kosmetik Baru</DialogTitle>
              <DialogDescription>Isi detail kosmetik. Bisa disimpan sebagai draft dulu.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <CosmeticForm value={form} onChange={setForm} />
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            Katalog ({items.length})
          </CardTitle>
          <CardDescription>Semua status ditampilkan di sini, bukan cuma yang published.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada kosmetik. Tambah yang pertama lewat tombol di atas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.slot === "avatar_border" ? (
                        <CosmeticAvatar avatarUrl={undefined} username="?" size={32} border={item} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.slot}
                      {item.sub_type ? ` / ${item.sub_type}` : ""}
                    </TableCell>
                    <TableCell>{item.price} TC</TableCell>
                    <TableCell className="text-xs">{item.min_rank || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLOR[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      {item.status !== "published" && (
                        <Button size="sm" variant="secondary" onClick={() => quickStatusChange(item, "published")}>
                          Terbitkan
                        </Button>
                      )}
                      {item.status !== "retired" && (
                        <Button size="sm" variant="ghost" onClick={() => quickStatusChange(item, "retired")}>
                          Tarik
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Kosmetik</DialogTitle>
            <DialogDescription>Perubahan harga/rank tidak retroaktif ke transaksi yang sudah terjadi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <CosmeticForm value={form} onChange={setForm} />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
