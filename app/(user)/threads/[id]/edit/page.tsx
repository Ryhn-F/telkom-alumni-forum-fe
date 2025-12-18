"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/axios";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import type { Category, CategoryListResponse, MessageResponse, Thread } from "@/types";
import { TiptapEditor } from "@/components/TiptapEditor";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditThreadPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [threadId, setThreadId] = useState("");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [audience, setAudience] = useState<"semua" | "guru" | "siswa">("semua");
  const [attachmentIds, setAttachmentIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and thread data in parallel
        const [categoriesRes, threadRes] = await Promise.all([
          api.get<CategoryListResponse>("/api/categories"),
          api.get<Thread>(`/api/threads/slug/${slug}`)
        ]);

        const categoriesData = categoriesRes.data.data || [];
        setCategories(categoriesData);

        const threadData = threadRes.data;
        if (!threadData) {
            toast.error("Diskusi tidak ditemukan");
            router.push("/threads");
            return;
        }

        setThreadId(threadData.id);
        setTitle(threadData.title);
        setContent(threadData.content);
        setAudience(threadData.audience);
        setAttachmentIds((threadData.attachments || []).map((a) => a.id));

        // Find category ID based on name
        const category = categoriesData.find(
          (c) => c.name === threadData.category_name
        );
        if (category) {
          setCategoryId(category.id);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Gagal memuat data diskusi");
        router.push("/threads");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }
    setSaving(true);
    try {
      await api.put<MessageResponse>(`/api/threads/${threadId}`, {
        title,
        content,
        category_id: categoryId,
        audience,
        attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
      });
      toast.success("Diskusi berhasil diperbarui");
      router.push(`/threads/${slug}`); // Navigate back to the thread detail using slug
    } catch {
      toast.error("Gagal memperbarui diskusi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
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
          <CardTitle>Edit Diskusi</CardTitle>
          <CardDescription>
            Perbarui konten diskusi Anda
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
                disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                isLoading={saving}
                placeholder="Tulis diskusi Anda di sini... (Anda bisa menyisipkan gambar)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
