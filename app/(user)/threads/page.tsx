"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, Loader2, Sparkles } from "lucide-react";
import type { Thread, ThreadListResponse, Reactions } from "@/types";
import { GuestBanner } from "@/components/GuestBanner";
import { ThreadFeedCard } from "@/components/ThreadFeedCard";
import { getToken } from "@/lib/cookies";

function ThreadsContent() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch threads for current page
  const loadThreads = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setFetchingMore(true);
    }

    try {
      const res = await api.get<ThreadListResponse>("/api/threads", {
        params: { page: pageNum, limit: 10, sort_by: "newest" },
      });

      const newThreads = res.data.data || [];
      const totalPages = res.data.meta?.total_pages || 1;

      if (isInitial) {
        setThreads(newThreads);
      } else {
        setThreads((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const filtered = newThreads.filter((t) => !existingIds.has(t.id));
          return [...prev, ...filtered];
        });
      }

      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadThreads(1, true);
  }, [loadThreads]);

  // Restore scroll position when returning back from thread detail
  useEffect(() => {
    if (!loading && threads.length > 0) {
      const savedScroll = sessionStorage.getItem("feed_scroll_position");
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
          sessionStorage.removeItem("feed_scroll_position");
        }, 50);
      }
    }
  }, [loading, threads]);

  // Handle reactions change locally in feed
  const handleReactionsChange = (threadId: string, newReactions: Reactions) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, reactions: newReactions } : t))
    );
  };

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!hasMore || loading || fetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadThreads(nextPage, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.2 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, loading, fetchingMore, loadThreads]);

  return (
    <div className="space-y-6">
      <GuestBanner />

      {/* Header Feed Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-red-600 dark:text-red-400" />
            Feed Diskusi Komunitas
          </h1>
          <p className="text-muted-foreground text-sm">
            Topik terbaru & terbanyak didiskusikan oleh siswa dan alumni Telkom
          </p>
        </div>
        <Link href={getToken() ? "/threads/new" : "/login?redirect=/threads/new"}>
          <Button className="gap-2 font-semibold shadow-md">
            <Plus className="h-4 w-4" />
            Buat Diskusi
          </Button>
        </Link>
      </div>

      {/* X/Twitter Style Threads Feed */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl p-4">
              <CardContent className="pt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : threads.length > 0 ? (
          <>
            {threads.map((thread) => (
              <ThreadFeedCard
                key={thread.id}
                thread={thread}
                onReactionsChange={(newReactions) =>
                  handleReactionsChange(thread.id, newReactions)
                }
              />
            ))}

            {/* Sentinel element for infinite scrolling */}
            <div ref={sentinelRef} className="py-6 text-center">
              {fetchingMore && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                  <span>Memuat diskusi berikutnya...</span>
                </div>
              )}
              {!hasMore && (
                <p className="text-xs text-muted-foreground/70 py-4">
                  ✨ Anda telah mencapai bagian akhir diskusi.
                </p>
              )}
            </div>
          </>
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center space-y-3">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/60" />
              <h3 className="font-semibold text-lg">Belum Ada Diskusi</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Jadilah yang pertama membuat diskusi baru untuk komunitas Telkom!
              </p>
              <Link href={getToken() ? "/threads/new" : "/login?redirect=/threads/new"}>
                <Button className="mt-2 font-semibold">Mulai Diskusi Pertama</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ThreadsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-2xl p-4">
          <CardContent className="pt-2 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-16 w-full" />
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
