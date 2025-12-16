"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  Send,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Thread, Post, PostListResponse, MessageResponse } from "@/types";
import { TiptapEditor } from "@/components/TiptapEditor";
import { RichTextDisplay } from "@/components/RichTextDisplay";

  export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuthStore();
  const slug = params.id as string;
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyAttachmentIds, setReplyAttachmentIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch thread details by slug
        const threadRes = await api.get<Thread>(`/api/threads/slug/${slug}`);
        const threadData = threadRes.data;
        
        setThread(threadData);
  // Fetch thread like status
        try {
          const likeRes = await api.get<{ liked: boolean }>(
            `/api/threads/${threadData.id}/like`
          );
          setLiked(likeRes.data.liked);
        } catch {
          // If 401/403 or error, default to false or keep existing
          setLiked(threadData.is_liked || false);
        }

        setLikesCount(threadData.likes_count || 0);

        // Fetch posts using the actual thread ID
        const postsRes = await api.get<PostListResponse>(
          `/api/threads/${threadData.id}/posts`
        );
        setPosts(postsRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch thread:", error);
        toast.error("Gagal memuat diskusi");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  const handleLike = async () => {
    if (!thread) return;
    try {
      if (liked) {
        await api.delete(`/api/threads/${thread.id}/like`);
        setLiked(false);
        setLikesCount((p) => p - 1);
      } else {
        await api.post(`/api/threads/${thread.id}/like`);
        setLiked(true);
        setLikesCount((p) => p + 1);
      }
    } catch {
      toast.error("Gagal memproses");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !thread) return;
    setSubmitting(true);
    try {
      const response = await api.post<Post>(`/api/threads/${thread.id}/posts`, {
        content: replyContent,
        attachment_ids: replyAttachmentIds.length > 0 ? replyAttachmentIds : undefined,
      });
      setPosts((prev) => [...prev, response.data]);
      setReplyContent("");
      setReplyAttachmentIds([]);
      toast.success("Balasan berhasil dikirim");
    } catch {
      toast.error("Gagal mengirim balasan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!thread) return;
    if (!confirm("Apakah Anda yakin ingin menghapus diskusi ini?")) return;
    try {
      await api.delete<MessageResponse>(`/api/threads/${thread.id}`);
      toast.success("Diskusi berhasil dihapus");
      router.push("/threads");
    } catch {
      toast.error("Gagal menghapus diskusi");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus balasan ini?")) return;
    try {
      await api.delete<MessageResponse>(`/api/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Balasan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus balasan");
    }
  };

  const isOwner = thread?.author === user?.username;
  const isAdmin = role?.name === "admin";

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  if (!thread)
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Diskusi tidak ditemukan</h2>
        <Link href="/threads">
          <Button>Kembali ke Diskusi</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
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
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{thread.category_name}</Badge>
                <Badge variant="outline">
                  {thread.audience === "semua"
                    ? "Umum"
                    : thread.audience === "guru"
                    ? "Guru"
                    : "Siswa"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold">{thread.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={thread.author_avatar} />
                  <AvatarFallback>
                    {thread.author[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{thread.author}</span>
                <span>•</span>
                <span>
                  {new Date(thread.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            {(isOwner || isAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <DropdownMenuItem asChild>
                      <Link href={`/threads/${slug}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleDeleteThread}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <RichTextDisplay content={thread.content} />
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {thread.views} views
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {posts.length} balasan
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Balasan ({posts.length})</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUser={user}
              isAdmin={isAdmin}
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada balasan. Jadilah yang pertama membalas!
            </CardContent>
          </Card>
        )}
      </div>
      <Separator />
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleReply} className="space-y-4">
             <TiptapEditor
               value={replyContent}
               onChange={setReplyContent}
               onAttachmentUpload={(id) => setReplyAttachmentIds((prev) => [...prev, id])}
               isLoading={submitting}
               placeholder="Tulis balasan Anda..."
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !replyContent.trim() || replyContent === "<p></p>"}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Kirim Balasan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PostItem({
  post,
  currentUser,
  isAdmin,
  onDelete,
}: {
  post: Post;
  currentUser: any;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await api.get<{ liked: boolean }>(
          `/api/posts/${post.id}/like`
        );
        setLiked(res.data.liked);
      } catch {
        setLiked(post.is_liked || false);
      }
    };
    fetchLikeStatus();
  }, [post.id]);

  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/api/posts/${post.id}/like`);
        setLiked(false);
        setLikesCount((p) => p - 1);
      } else {
        await api.post(`/api/posts/${post.id}/like`);
        setLiked(true);
        setLikesCount((p) => p + 1);
      }
    } catch {
      toast.error("Gagal memproses like post");
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author_avatar} />
              <AvatarFallback>{post.author[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{post.author}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="text-sm mt-1">
                 <RichTextDisplay content={post.content} />
              </div>
              {/* Post Actions (Like) */}
              <div className="flex items-center gap-4 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 gap-1.5 ${
                    liked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"
                  }`}
                  onClick={handleLike}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`}
                  />
                  <span className="text-xs">{likesCount}</span>
                </Button>
              </div>
            </div>
          </div>
          {(post.author === currentUser?.username || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(post.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
