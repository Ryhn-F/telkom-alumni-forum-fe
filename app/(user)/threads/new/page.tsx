"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import type { Category, CategoryListResponse, MessageResponse } from "@/types";
import { TiptapEditor } from "@/components/TiptapEditor";
import { useAuthStore } from "@/stores/auth-store";
import { getToken } from "@/lib/cookies";
import { Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewThreadPage() {
  const router = useRouter();
  const { role } = useAuthStore();
  const [isGuest, setIsGuest] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setIsGuest(true);
      return;
    }
  }, []);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [audience, setAudience] = useState<"semua" | "guru" | "siswa">("semua");
  const [attachmentIds, setAttachmentIds] = useState<number[]>([]);

  useEffect(() => {
    api
      .get<CategoryListResponse>("/api/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => toast.error("Gagal memuat kategori"))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }
    const contentText = content.replace(/<[^>]*>/g, "");
    if (contentText.length > 10000) {
      toast.error("Konten tidak boleh lebih dari 10.000 karakter");
      return;
    }
    setLoading(true);
    try {
      await api.post<MessageResponse>("/api/threads", {
        title,
        content,
        category_id: categoryId,
        audience,
        attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
      });
      toast.success("Diskusi berhasil dibuat");
      router.push("/threads");
    } catch (error: any) {
      // Try to get the error message from backend response
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Gagal membuat diskusi";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6">
        <div className="h-16 w-16 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Autentikasi Diperlukan</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Anda perlu masuk ke akun terlebih dahulu sebelum dapat membuat atau mempublikasikan diskusi baru.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/login?redirect=/threads/new" className="flex-1">
            <Button className="w-full gap-2 font-semibold shadow-sm">
              <LogIn className="h-4 w-4" />
              Masuk Sekarang
            </Button>
          </Link>
          <Link href="/register" className="flex-1">
            <Button variant="outline" className="w-full gap-2 font-semibold">
              <UserPlus className="h-4 w-4" />
              Daftar Akun
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Buat Diskusi Baru</CardTitle>
          <CardDescription>
            Mulai diskusi baru dengan komunitas alumni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Judul <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Masukkan judul diskusi..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                disabled={loading}
                required
              />
              <div className="text-xs text-muted-foreground text-right">
                {title.length}/120
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Kategori <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={loading || categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Target Pembaca <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={audience}
                  onValueChange={(v) =>
                    setAudience(v as "semua" | "guru" | "siswa")
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua (Umum)</SelectItem>
                    {(role?.name === "admin" || role?.name === "guru") && (
                      <SelectItem value="guru">Khusus Guru</SelectItem>
                    )}
                    {(role?.name === "admin" || role?.name === "siswa") && (
                      <SelectItem value="siswa">Khusus Siswa</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">
                Konten <span className="text-destructive">*</span>
              </Label>
              <TiptapEditor
                value={content}
                onChange={setContent}
                onAttachmentUpload={(id) => setAttachmentIds((prev) => [...prev, id])}
                isLoading={loading}
                placeholder="Tulis diskusi Anda di sini... (Anda bisa menyisipkan gambar)"
              />
              <div className="text-xs text-muted-foreground text-right">
                {content.replace(/<[^>]*>/g, "").length}/10000
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Publikasikan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
