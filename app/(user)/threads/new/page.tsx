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

export default function NewThreadPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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
    } catch {
      toast.error("Gagal membuat diskusi");
    } finally {
      setLoading(false);
    }
  };

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
                disabled={loading}
                required
              />
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
                    <SelectItem value="guru">Khusus Guru</SelectItem>
                    <SelectItem value="siswa">Khusus Siswa</SelectItem>
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
