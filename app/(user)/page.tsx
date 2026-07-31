"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores";
import { getToken } from "@/lib/cookies";
import { getRoleDisplayName } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  Sparkles,
} from "lucide-react";
import { LeaderboardPreview } from "@/components/LeaderboardPreview";
import { GuestBanner } from "@/components/GuestBanner";
import { ThreadFeedCard } from "@/components/ThreadFeedCard";
import type { Thread, ThreadListResponse, Reactions } from "@/types";

export default function HomePage() {
  const { profile, role } = useAuthStore();
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [trendingThreads, setTrendingThreads] = useState<Thread[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, trendingRes, userCountRes] = await Promise.all([
          api.get<ThreadListResponse>("/api/threads", { params: { page: 1, limit: 10 } }),
          api.get<{ data: Thread[] }>("/api/threads/trending", {
            params: { limit: 5 },
          }),
          api.get<{ total_users: number }>("/api/users/count"),
        ]);
        setRecentThreads(recentRes.data.data || []);
        setTrendingThreads(trendingRes.data.data || []);
        setUserCount(userCountRes.data.total_users || 0);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Restore scroll position when returning back from thread detail
  useEffect(() => {
    if (!loading && recentThreads.length > 0) {
      const savedScroll = sessionStorage.getItem("feed_scroll_position");
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
          sessionStorage.removeItem("feed_scroll_position");
        }, 50);
      }
    }
  }, [loading, recentThreads]);

  const handleReactionsChange = (threadId: string, newReactions: Reactions) => {
    setRecentThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, reactions: newReactions } : t))
    );
  };

  return (
    <div className="space-y-8">
      <GuestBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-background p-6 md:p-8 border border-red-500/15">
        <div className="relative z-10 space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Selamat datang, {profile?.full_name?.split(" ")[0] || "Alumni"}! 👋
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {role && `Anda masuk sebagai ${getRoleDisplayName(role.name)}. `}Apa yang ingin Anda diskusikan dengan komunitas Telkom hari ini?
          </p>
          <div className="pt-2">
            <Link href={getToken() ? "/threads/new" : "/login?redirect=/threads/new"}>
              <Button className="gap-2 hover:scale-105 transition-transform shadow-md font-semibold">
                <Plus className="h-4 w-4" />
                Mulai Diskusi Baru
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover-lift border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anggota Komunitas</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : userCount}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Guru, Siswa, & Alumni terdaftar
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topik Trending</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                trendingThreads[0]?.views || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Views pada diskusi paling hangat
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Leaderboard Preview */}
      <section>
        <LeaderboardPreview />
      </section>

      {/* X/Twitter Style Main Social Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold tracking-tight">Feed Diskusi Terbaru</h2>
          </div>
          <Link href="/threads">
            <Button variant="ghost" size="sm" className="gap-1 font-medium text-xs text-red-600 hover:text-red-700">
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-2xl p-4">
              <CardContent className="pt-2 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : recentThreads.length > 0 ? (
          <div className="space-y-4">
            {recentThreads.map((thread) => (
              <ThreadFeedCard
                key={thread.id}
                thread={thread}
                onReactionsChange={(newReactions) =>
                  handleReactionsChange(thread.id, newReactions)
                }
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada diskusi terbaru.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
