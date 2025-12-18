"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Mail,
  Calendar,
  GraduationCap,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Thread, ThreadListResponse } from "@/types";

export default function ProfilePage() {
  const { user, role, profile } = useAuthStore();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // Show 5 per page

  useEffect(() => {
    if (user?.username) {
      setLoading(true);
      api
        .get<ThreadListResponse>("/api/threads/me", { params: { page, limit } })
        .then((res) => {
          setThreads(res.data.data || []);
          setTotalPages(res.data.meta.total_pages);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.username, page]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {(profile?.full_name || user?.username || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile?.full_name || user?.username}
                  </h1>
                  <p className="text-muted-foreground">@{user?.username}</p>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Profil
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {role && getRoleDisplayName(role.name)}
                </Badge>
                {profile?.class_grade && (
                  <Badge variant="outline">Kelas {profile.class_grade}</Badge>
                )}
              </div>
              {profile?.bio && (
                  <p className="text-sm text-muted-foreground mt-4">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Bergabung</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at &&
                    new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Diskusi Saya
          </CardTitle>
          <CardDescription>Diskusi yang pernah Anda buat</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : threads.length > 0 ? (
            <div className="space-y-3">
              {threads.map((thread, index) => (
                <div key={thread.id}>
                  <Link href={`/threads/${thread.slug}`}>
                    <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {thread.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {thread.category_name}
                        </Badge>
                        <span>{thread.views} views</span>
                        <span>•</span>
                         <span>
                          {new Date(thread.created_at).toLocaleDateString(
                            "id-ID"
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
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
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Anda belum membuat diskusi apapun.</p>
              <Link href="/threads/new">
                <Button>Buat Diskusi Pertama</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
