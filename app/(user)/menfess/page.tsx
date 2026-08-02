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
  Pin,
  Sparkles,
  StickyNote,
} from "lucide-react";
import type {
  Menfess,
  MenfessListResponse,
  MessageResponse,
  Reactions,
} from "@/types";
import { ReactionBar } from "@/components/ReactionBar";

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

  // Handler for updating reactions in list
  const handleReactionsChange = (
    menfessId: string,
    newReactions: Reactions
  ) => {
    setMenfessList((prev) =>
      prev.map((m) =>
        m.id === menfessId ? { ...m, reactions: newReactions } : m
      )
    );
  };

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
      toast.error(
        `Pesan tidak boleh lebih dari ${MENFESS_CONTENT_MAX} karakter`
      );
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
      <Dialog>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 mt-5">
                  <Shield className="h-5 w-5 text-primary" />
                  Transparansi Privasi: Bagaimana Fitur Ini Bekerja?
                </DialogTitle>
                <DialogDescription>
                  Berikut adalah langkah teknis yang diterapkan untuk memastikan
                  anonimitas Anda:
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
                      <li>
                        Besok, kode acak ini akan hangus dan diganti baru.
                      </li>
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
                      detik untuk mencegah pelacakan melalui pencocokan waktu
                      (time-correlation).
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
                        Akun dengan role Guru secara sistem tidak bisa
                        mengakses, membaca, ataupun mengirim Menfess.
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

        {/* Post Form */}
        <Card className="border-red-100 dark:border-red-900/30 shadow-sm bg-gradient-to-br from-background via-background to-red-50/20 dark:to-red-950/10">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <StickyNote className="h-5 w-5 text-red-600" />
                  Tempel Pesan Rahasia di Papan
                </CardTitle>
                <CardDescription>
                  Tulis ungkapan, saran, atau curhatmu secara anonim. Identitasmu dijamin 100% aman & terenkripsi.
                </CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Eye className="h-4 w-4" />
                  Cara Kerja
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Tulis pesan rahasiamu di sini... (Contoh: Semangat buat angkatan 2026 yang lagi TA! 🚀)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MENFESS_CONTENT_MAX}
                disabled={submitting}
                rows={3}
                className="resize-none border-dashed focus:border-solid text-sm"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-red-500" />
                  Pesan dikirim 100% anonim
                </span>
                <span>
                  {content.length}/{MENFESS_CONTENT_MAX}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting || !content.trim()}
              className="gap-2 font-semibold shadow-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Tempel Pesan Rahasia
            </Button>
          </form>
        </CardContent>
        </Card>
      </Dialog>

      {/* Menfess Whiteboard Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-red-600" />
            <h2 className="text-lg font-semibold tracking-tight">Papan Sticky Notes ({total})</h2>
          </div>
          {totalPages > 1 && (
            <span className="text-xs text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
          )}
        </div>

        {/* Whiteboard Surface */}
        <div className="p-4 md:p-6 rounded-3xl bg-gradient-to-b from-stone-100/80 via-zinc-50 to-stone-100/60 dark:from-zinc-950 dark:via-stone-900/40 dark:to-zinc-950 border border-dashed border-red-200/80 dark:border-red-900/40 shadow-inner min-h-[350px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-36 rounded-2xl">
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : menfessList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menfessList.map((menfess, index) => {
                  const noteTones = [
                    "bg-rose-50/90 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40 rotate-[-1deg]",
                    "bg-red-50/90 dark:bg-red-950/30 border-red-200/80 dark:border-red-900/40 rotate-[1deg]",
                    "bg-amber-50/90 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-900/30 rotate-[-0.5deg]",
                    "bg-stone-50/90 dark:bg-zinc-900/40 border-stone-200/80 dark:border-zinc-800 rotate-[0.8deg]",
                  ];
                  const toneClass = noteTones[index % noteTones.length];

                  return (
                    <div key={menfess.id} className="relative group pt-3">
                      {/* Pushpin Badge */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1 z-10 tracking-wider uppercase">
                        <Pin className="h-3 w-3" /> PESAN
                      </div>

                      <Card
                        className={`relative overflow-hidden transition-all duration-300 hover:rotate-0 hover:scale-[1.02] hover:shadow-xl shadow-sm border rounded-2xl ${toneClass}`}
                      >
                        <CardContent className="pt-5 pb-4 px-5 space-y-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground/80 border-b border-border/30 pb-2">
                            <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                              <Lock className="h-3 w-3" /> Anonim
                            </span>
                            <span className="text-[11px]">
                              {new Date(menfess.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>

                          <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 font-sans min-h-[60px]">
                            "{menfess.content}"
                          </p>

                          <div className="pt-2 border-t border-border/30">
                            <ReactionBar
                              referenceId={menfess.id}
                              referenceType="menfess"
                              reactions={
                                menfess.reactions || {
                                  counts: {},
                                  user_reacted: null,
                                }
                              }
                              onReactionsChange={(newReactions) =>
                                handleReactionsChange(menfess.id, newReactions)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">
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
            <div className="py-12 text-center text-muted-foreground space-y-3">
              <StickyNote className="h-12 w-12 mx-auto text-red-400/60" />
              <h3 className="font-semibold text-base">Papan Menfess Masih Kosong</h3>
              <p className="text-xs max-w-sm mx-auto text-muted-foreground/80">
                Belum ada pesan rahasia yang ditempel. Tempelkan pesan pertama Anda sekarang!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
