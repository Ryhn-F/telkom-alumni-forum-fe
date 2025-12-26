"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Eye,
  MessageSquare,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  Thread,
  ThreadListResponse,
  Category,
  CategoryListResponse,
} from "@/types";

function ThreadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const categoryId = searchParams.get("category_id") || "";
  const audience = searchParams.get("audience") || "";
  const sortBy = searchParams.get("sort_by") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 10 };
        if (categoryId) params.category_id = categoryId;
        if (audience) params.audience = audience;
        if (sortBy) params.sort_by = sortBy;
        const [threadsRes, categoriesRes] = await Promise.all([
          api.get<ThreadListResponse>("/api/threads", { params }),
          api.get<CategoryListResponse>("/api/categories"),
        ]);
        setThreads(threadsRes.data.data || []);
        setTotalPages(threadsRes.data.meta?.total_pages || 1);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch threads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, audience, sortBy, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/threads?${params.toString()}`);
  };

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/threads?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Diskusi</h1>
          <p className="text-muted-foreground">
            Jelajahi semua diskusi di forum
          </p>
        </div>
        <Link href="/threads/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Diskusi
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Select
              value={categoryId || "all"}
              onValueChange={(v) => updateFilter("category_id", v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={audience || "all_audiences"}
              onValueChange={(v) =>
                updateFilter("audience", v === "all_audiences" ? "" : v)
              }
            >
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_audiences">Semua</SelectItem>
                <SelectItem value="semua">Umum</SelectItem>
                <SelectItem value="guru">Guru</SelectItem>
                <SelectItem value="siswa">Siswa</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy || "newest"}
              onValueChange={(v) => updateFilter("sort_by", v === "newest" ? "" : v)}
            >
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Terbaru" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="popular">Terpopuler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Thread list with staggered animation */}
      <div className="space-y-4 animate-stagger">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : threads.length > 0 ? (
          threads.map((thread) => (
            <Link key={thread.id} href={`/threads/${thread.slug}`}>
              <Card className="hover-lift cursor-pointer border-border/50 hover:border-border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                        {thread.title}
                      </h3>
                      <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-3 leading-relaxed">
                        {thread.content.replace(/<[^>]*>/g, "").slice(0, 150)}
                        ...
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {thread.category_name}
                        </Badge>
                        <Badge variant="outline">
                          {thread.audience === "semua"
                            ? "Umum"
                            : thread.audience === "guru"
                            ? "Guru"
                            : "Siswa"}
                        </Badge>
                        <span
                          className="text-xs text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/users/${thread.author.username}`;
                          }}
                        >
                          oleh {thread.author.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          •{" "}
                          {new Date(thread.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {thread.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {thread.likes_count || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">
                Tidak ada diskusi ditemukan
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Coba ubah filter atau buat diskusi baru
              </p>
              <Link href="/threads/new">
                <Button>Buat Diskusi</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function ThreadsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card>
        <CardContent className="pt-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ThreadsPage() {
  return (
    <Suspense fallback={<ThreadsLoading />}>
      <ThreadsContent />
    </Suspense>
  );
}
