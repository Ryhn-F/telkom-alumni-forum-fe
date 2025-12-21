"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores";
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
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
} from "lucide-react";
import type { Thread, ThreadListResponse } from "@/types";

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
          api.get<ThreadListResponse>("/api/threads", { params: { page: 1, limit: 5 } }),
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

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Selamat datang, {profile?.full_name?.split(" ")[0] || "Alumni"}! 👋
          </h1>
          <p className="text-muted-foreground mb-4">
            {role && `Anda masuk sebagai ${getRoleDisplayName(role.name)}. `}Apa
            yang ingin Anda diskusikan hari ini?
          </p>
          <Link href="/threads/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Mulai Diskusi Baru
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : userCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Guru dan siswa terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                trendingThreads[0]?.views || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Views pada diskusi viral
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Diskusi Terbaru</CardTitle>
              <CardDescription>Diskusi yang baru saja dibuat</CardDescription>
            </div>
            <Link href="/threads">
              <Button variant="ghost" size="sm" className="gap-1">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentThreads.length > 0 ? (
              <div className="space-y-4">
                {recentThreads.map((thread) => (
                  <Link key={thread.id} href={`/threads/${thread.slug}`}>
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {thread.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {thread.category_name}
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
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Eye className="h-3 w-3 mr-1" />
                        {thread.views}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada diskusi. Jadilah yang pertama!
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sedang Trending</CardTitle>
              <CardDescription>Diskusi terhangat saat ini</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : trendingThreads.length > 0 ? (
              <div className="space-y-4">
                {trendingThreads.map((thread, index) => (
                  <Link key={thread.id} href={`/threads/${thread.slug}`}>
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {thread.title}
                        </h4>
                        <span
                          className="text-xs text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/users/${thread.author.username}`;
                          }}
                        >
                          {thread.author.username}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Eye className="h-3 w-3 mr-1" />
                        {thread.views}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada diskusi trending.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
