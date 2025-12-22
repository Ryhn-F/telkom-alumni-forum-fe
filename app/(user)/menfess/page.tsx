"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Lock,
  Shield,
  Send,
  Loader2,
  Eye,
  Clock,
  Database,
  UserX,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  Github,
} from "lucide-react";
import type { Menfess, MenfessListResponse, MessageResponse } from "@/types";

const MENFESS_CONTENT_MAX = 1000;

export default function MenfessPage() {
  const router = useRouter();
  const { role } = useAuthStore();

  const [menfessList, setMenfessList] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Block guru role
  useEffect(() => {
    if (role?.name === "guru") {
      router.replace("/");
      toast.error("Anda tidak memiliki akses ke halaman ini");
    }
  }, [role, router]);

  // Fetch menfess list
  const fetchMenfess = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await api.get<MenfessListResponse>("/api/menfess", {
        params: { page: pageNum, limit },
      });
      setMenfessList(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(Math.ceil((res.data.total || 0) / limit));
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.replace("/");
        toast.error("Anda tidak memiliki akses ke halaman ini");
      } else {
        console.error("Failed to fetch menfess:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role?.name !== "guru") {
      fetchMenfess(page);
    }
  }, [page, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Pesan tidak boleh kosong");
      return;
    }
    if (content.length > MENFESS_CONTENT_MAX) {
      toast.error(`Pesan tidak boleh lebih dari ${MENFESS_CONTENT_MAX} karakter`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post<MessageResponse>("/api/menfess", { content });
      toast.success("Menfess berhasil dikirim secara anonim");
      setContent("");
      // Refresh list
      await fetchMenfess(1);
      setPage(1);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Gagal mengirim menfess";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render anything for guru
  if (role?.name === "guru") {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Privacy Banner */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🔒 Student-Only Zone & 100% Anonim
              </CardTitle>
              <CardDescription className="mt-1">
                Ruang khusus siswa. Guru tidak bisa akses, tidak bisa
                lihat, dan tidak bisa posting. Privasi dijaga enkripsi,
                identitasmu rahasia.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                🔍 Cek Cara Kerjanya & Source Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 mt-5">
                  <Shield className="h-5 w-5 text-primary" />
                  Transparansi Privasi: Bagaimana Fitur Ini Bekerja?
                </DialogTitle>
                <DialogDescription>
                  Berikut adalah langkah teknis yang diterapkan untuk
                  memastikan anonimitas Anda:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                {/* 1. No-Log */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Kebijakan "No-Log" Server
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Biasanya server mencatat siapa yang mengakses sebuah
                      halaman (IP Address). Khusus untuk fitur Menfess, kami
                      mematikan pencatatan log (Access Logs) di level server dan
                      aplikasi. Artinya, request Anda tidak meninggalkan jejak
                      digital apa pun di server kami.
                    </p>
                  </div>
                </div>

                {/* 2. Blind Hashing */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Tiket Harian Terenkripsi (Blind Hashing)
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Untuk membatasi spam (maks 2x sehari), kami menggunakan
                      sistem "Blind Ticket".
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>
                        Sistem mengecek kuota Anda menggunakan kode acak (Hash)
                        yang berubah setiap hari.
                      </li>
                      <li>Besok, kode acak ini akan hangus dan diganti baru.</li>
                      <li>
                        Akibatnya, admin tidak bisa melacak riwayat pengiriman
                        Anda kemarin, karena kuncinya sudah dimusnahkan oleh
                        sistem secara otomatis setiap jam 00:00.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 3. Database Tanpa Identitas */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-500" />
                      Database Tanpa Identitas
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Di dalam database kami, tabel Menfess didesain tanpa kolom
                      User ID. Kami benar-benar memisahkan data akun Anda dari
                      pesan yang Anda kirim.
                    </p>
                  </div>
                </div>

                {/* 4. Fuzzy Timestamp */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      Penyamaran Waktu (Fuzzy Timestamp)
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Kami tidak menyimpan waktu pengiriman hingga ke satuan
                      detik untuk mencegah pelacakan
                      melalui pencocokan waktu (time-correlation).
                    </p>
                  </div>
                </div>

                {/* 5. Zona Eksklusif Siswa */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-500" />
                      Zona Eksklusif Siswa
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Kami mengerti bahwa ada hal-hal yang hanya dimengerti oleh
                      sesama siswa. Oleh karena itu, kami menerapkan pembatasan
                      akses ketat pada level kode (backend):
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>
                        Akun dengan role Guru secara sistem
                        tidak bisa mengakses, membaca, ataupun mengirim Menfess.
                      </li>
                      <li>
                        Fitur ini tidak akan muncul di menu navigasi Guru.
                      </li>
                      <li>
                        Jika Guru mencoba mengakses lewat URL langsung, sistem
                        akan menolak akses tersebut (403 Forbidden).
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Developer Section */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Github className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        👩‍💻 Untuk Developer & Kontributor
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        Anda bisa mengaudit kode keamanan kami, melaporkan bug,
                        atau ikut berkontribusi mengembangkan fitur baru.
                      </p>
                      <a
                        href="https://github.com/Ryhn-F/telkom-alumni-forum-fe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <Github className="h-4 w-4" />
                          Source Code Frontend
                        </Button>
                      </a>
                      <a
                        href="https://github.com/fardhanrasya/telkom-alumni-forum"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <Github className="h-4 w-4" />
                          Source Code Backend
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Post Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Kirim Menfess Anonim
          </CardTitle>
          <CardDescription>
            Pesan Anda akan dikirim tanpa identitas. Maksimal 2 pesan per hari.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Tulis di sini... Identitasmu aman 🔒"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MENFESS_CONTENT_MAX}
                disabled={submitting}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Pesan akan dikirim secara anonim
                </span>
                <span>
                  {content.length}/{MENFESS_CONTENT_MAX}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting || !content.trim()}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Kirim Anonim
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Menfess List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Menfess Terbaru ({total})
          </h2>
          {totalPages > 1 && (
            <span className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : menfessList.length > 0 ? (
          <>
            <div className="space-y-4">
              {menfessList.map((menfess) => (
                <Card key={menfess.id} className="hover-lift border-border/50 hover:border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-full">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            Anonim
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(menfess.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                          {menfess.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {page} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada menfess. Jadilah yang pertama!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
