"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchStore } from "@/stores";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MessageSquare,
  BookOpen,
  Eye,
  Heart,
  Loader2,
  ArrowLeft,
  Clock,
} from "lucide-react";
import type { MeilisearchThread, MeilisearchPost } from "@/types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function highlightText(text: string): React.ReactNode {
  const parts = text.split(/(<mark>.*?<\/mark>)/g);
  return parts.map((part, index) => {
    if (part.startsWith("<mark>") && part.endsWith("</mark>")) {
      const content = part.slice(6, -7);
      return (
        <mark
          key={index}
          className="bg-primary/30 text-foreground rounded px-0.5"
        >
          {content}
        </mark>
      );
    }
    return <span key={index}>{stripHtml(part)}</span>;
  });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ThreadCard({ thread }: { thread: MeilisearchThread }) {
  const formatted = thread._formatted;
  const username = thread.user?.username || "Anonim";
  const categoryName = thread.category?.name || "Kategori";

  return (
    <Link href={`/threads/${thread.slug}`}>
      <Card className="hover:bg-muted/50 transition-all cursor-pointer group">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="secondary">{categoryName}</Badge>
                <Badge variant="outline">
                  {thread.audience === "semua"
                    ? "Umum"
                    : thread.audience === "guru"
                    ? "Guru"
                    : "Siswa"}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {formatted?.title
                  ? highlightText(formatted.title)
                  : thread.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {formatted?.content
                  ? highlightText(stripHtml(formatted.content))
                  : stripHtml(thread.content).slice(0, 200)}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span
                  className="hover:text-primary cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/users/${username}`;
                  }}
                >
                  oleh <span className="font-medium">{username}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(thread.created_at)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
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
  );
}

function PostCard({ post }: { post: MeilisearchPost }) {
  const formatted = post._formatted;
  const username = post.user?.username || "Anonim";

  return (
    <Link href={`/threads/${post.thread_slug}`}>
      <Card className="hover:bg-muted/50 transition-all cursor-pointer group">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-secondary shrink-0">
              <MessageSquare className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-2">
                Balasan di:{" "}
                <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                  {post.thread_title}
                </span>
              </p>
              <p className="text-sm line-clamp-3 mb-3">
                {formatted?.content
                  ? highlightText(stripHtml(formatted.content))
                  : stripHtml(post.content).slice(0, 200)}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span
                  className="hover:text-primary cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/users/${username}`;
                  }}
                >
                  oleh <span className="font-medium">{username}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(post.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post.likes_count || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(queryParam);

  const {
    query,
    threads,
    posts,
    isSearching,
    isLoadingMoreThreads,
    isLoadingMorePosts,
    error,
    activeTab,
    setActiveTab,
    search,
    loadMoreThreads,
    loadMorePosts,
    clearResults,
  } = useSearchStore();

  // Search on mount if query param exists
  useEffect(() => {
    if (queryParam && queryParam !== query) {
      setSearchInput(queryParam);
      search(queryParam);
    }
  }, [queryParam, query, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
      search(searchInput);
    }
  };

  const handleClear = () => {
    setSearchInput("");
    clearResults();
    router.push("/search");
  };

  const hasThreadResults = threads && threads.results.length > 0;
  const hasPostResults = posts && posts.hits.length > 0;
  const hasResults = hasThreadResults || hasPostResults;
  const totalResults = (threads?.total || 0) + (posts?.estimatedTotalHits || 0);

  const canLoadMoreThreads = threads && threads.results.length < threads.total;
  const canLoadMorePosts = posts && posts.hits.length < posts.estimatedTotalHits;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pencarian</h1>
          {query && (
            <p className="text-muted-foreground">
              {isSearching ? (
                "Mencari..."
              ) : hasResults ? (
                <>
                  Ditemukan {totalResults} hasil untuk &quot;{query}&quot;
                </>
              ) : (
                <>Tidak ada hasil untuk &quot;{query}&quot;</>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari diskusi atau balasan..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cari"
              )}
            </Button>
            {searchInput && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Hapus
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isSearching && !threads && !posts && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Query */}
      {!query && !isSearching && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Cari diskusi dan balasan
            </h3>
            <p className="text-muted-foreground">
              Masukkan kata kunci untuk mulai mencari
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {query && !isSearching && !hasResults && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Tidak ada hasil ditemukan
            </h3>
            <p className="text-muted-foreground mb-4">
              Coba gunakan kata kunci yang berbeda
            </p>
            <Link href="/threads">
              <Button variant="outline">Jelajahi Diskusi</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasResults && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "all" | "threads" | "posts")}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Semua ({totalResults})</TabsTrigger>
            <TabsTrigger value="threads">
              Diskusi ({threads?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Balasan ({posts?.estimatedTotalHits || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            {/* Threads section */}
            {hasThreadResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Diskusi
                  </h2>
                  {threads && threads.total > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("threads")}
                    >
                      Lihat semua ({threads.total})
                    </Button>
                  )}
                </div>
                {threads?.results.slice(0, 3).map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            )}

            {/* Posts section */}
            {hasPostResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Balasan
                  </h2>
                  {posts && posts.estimatedTotalHits > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("posts")}
                    >
                      Lihat semua ({posts.estimatedTotalHits})
                    </Button>
                  )}
                </div>
                {posts?.hits.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="threads" className="mt-6 space-y-4">
            {hasThreadResults ? (
              <>
                {threads?.results.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
                {canLoadMoreThreads && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreThreads}
                      disabled={isLoadingMoreThreads}
                    >
                      {isLoadingMoreThreads ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        "Muat lebih banyak"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Tidak ada diskusi ditemukan
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {hasPostResults ? (
              <>
                {posts?.hits.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {canLoadMorePosts && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMorePosts}
                      disabled={isLoadingMorePosts}
                    >
                      {isLoadingMorePosts ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        "Muat lebih banyak"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Tidak ada balasan ditemukan
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
