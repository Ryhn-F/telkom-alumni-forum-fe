"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  GraduationCap,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Eye,
  MessageSquare,
  Heart,
} from "lucide-react";
import type { Thread, ThreadListResponse, PublicProfile } from "@/types";

// Helper untuk display role
function getRoleDisplayName(roleName: string): string {
  const roleMap: Record<string, string> = {
    admin: "Administrator",
    guru: "Guru",
    siswa: "Siswa",
  };
  return roleMap[roleName] || roleName;
}

// Komponen untuk badge role dengan warna
function RoleBadge({ role }: { role: string }) {
  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
    guru: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    siswa: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <Badge 
      variant="outline" 
      className={`gap-1 ${roleColors[role] || ""}`}
    >
      <GraduationCap className="h-3 w-3" />
      {getRoleDisplayName(role)}
    </Badge>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const username = params.username as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalThreads, setTotalThreads] = useState(0);
  const limit = 5;

  // Redirect ke halaman profil sendiri jika username sama dengan user yang login
  useEffect(() => {
    if (currentUser?.username === username) {
      router.replace("/profile");
    }
  }, [currentUser?.username, username, router]);

  // Fetch profil pengguna
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<PublicProfile>(`/api/profile/${username}`);
        setProfile(res.data);
      } catch (err: unknown) {
        console.error("Failed to fetch profile:", err);
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          setError("Pengguna tidak ditemukan");
        } else {
          setError("Gagal memuat profil pengguna");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username && currentUser?.username !== username) {
      fetchProfile();
    }
  }, [username, currentUser?.username]);

  // Fetch thread milik pengguna
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setThreadsLoading(true);
        const res = await api.get<ThreadListResponse>(
          `/api/threads/user/${username}`,
          { params: { page, limit } }
        );
        setThreads(res.data.data || []);
        setTotalPages(res.data.meta.total_pages);
        setTotalThreads(res.data.meta.total_items);
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setThreads([]);
      } finally {
        setThreadsLoading(false);
      }
    };

    if (username && !error && currentUser?.username !== username) {
      fetchThreads();
    }
  }, [username, page, error, currentUser?.username]);

  // Jika loading
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Jika error tidak ditemukan
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">{error}</h2>
              <p className="text-muted-foreground">
                Pengguna dengan username &quot;{username}&quot; tidak dapat ditemukan.
              </p>
              <Button onClick={() => router.back()} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header dengan tombol kembali */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Profil Pengguna</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      {/* Kartu Profil Utama */}
      <Card className="overflow-hidden">
        {/* Banner Gradient */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
        
        <CardContent className="relative pt-0">
          {/* Avatar yang overlap dengan banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url} alt={profile.username} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left sm:pb-2">
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <RoleBadge role={profile.role} />
                {profile.class_grade && (
                  <Badge variant="outline" className="gap-1">
                    Kelas {profile.class_grade}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Info bergabung */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Bergabung sejak{" "}
                {new Date(profile.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalThreads}</p>
                <p className="text-sm text-muted-foreground">Diskusi</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {threads.reduce((acc, t) => acc + (t.views || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
              <Eye className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {threads.reduce((acc, t) => acc + (t.likes_count || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
              <Heart className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Diskusi oleh @{profile.username}
          </CardTitle>
          <CardDescription>
            {totalThreads > 0
              ? `${totalThreads} diskusi yang pernah dibuat`
              : "Pengguna ini belum membuat diskusi apapun"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threadsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : threads.length > 0 ? (
            <div className="space-y-3">
              {threads.map((thread, index) => (
                <div key={thread.id}>
                  <Link href={`/threads/${thread.slug}`}>
                    <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                      <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {thread.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {thread.category_name}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{thread.views}</span>
                        </div>
                        {thread.likes_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{thread.likes_count}</span>
                          </div>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(thread.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {index < threads.length - 1 && <Separator className="my-2" />}
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Sebelumnya
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Halaman {page} dari {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Pengguna ini belum membuat diskusi apapun.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
