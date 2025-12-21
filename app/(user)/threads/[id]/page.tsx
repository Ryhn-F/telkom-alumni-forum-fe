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
  Reply,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
} from "lucide-react";
import type { Thread, Post, PostParent, PostListResponse, MessageResponse } from "@/types";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [postsLoading, setPostsLoading] = useState(false);
  const POSTS_PER_PAGE = 10;

  // Nested reply state
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);

  // State for post parent map (for showing "replying to" indicator)
  const [postMap, setPostMap] = useState<Map<string, PostParent>>(new Map());

  // Function to fetch posts with pagination - keeps tree structure
  const fetchPosts = async (threadId: string, page: number = 1) => {
    setPostsLoading(true);
    try {
      const postsRes = await api.get<PostListResponse>(
        `/api/threads/${threadId}/posts`,
        { params: { page, limit: POSTS_PER_PAGE } }
      );
      
      // Build a map of all posts for parent reference
      const postsData = postsRes.data.data || [];
      const newPostMap = new Map<string, PostParent>();
      
      // Recursive function to collect all posts including nested ones
      const collectPosts = (postList: Post[]) => {
        for (const post of postList) {
          newPostMap.set(post.id, {
            id: post.id,
            content: post.content,
            author: post.author,
          });
          if (post.replies && post.replies.length > 0) {
            collectPosts(post.replies);
          }
        }
      };
      collectPosts(postsData);
      setPostMap(newPostMap);
      
      // Keep tree structure - don't flatten
      setPosts(postsData);
      setTotalPages(postsRes.data.meta?.total_pages || 1);
      setTotalItems(postsRes.data.meta?.total_items || 0);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

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

        // Fetch posts using the actual thread ID with pagination
        await fetchPosts(threadData.id, 1);
      } catch (error) {
        console.error("Failed to fetch thread:", error);
        toast.error("Gagal memuat diskusi");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  // Effect to refetch posts when page changes
  useEffect(() => {
    if (thread && currentPage > 0) {
      fetchPosts(thread.id, currentPage);
    }
  }, [currentPage]);

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

  // Pagination handler
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to replies section
      document.getElementById("replies-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handler to start replying to a specific post
  const handleReplyToPost = (post: Post) => {
    setReplyToPost(post);
    // Scroll to reply form
    document.getElementById("reply-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Cancel replying to a post
  const cancelReplyToPost = () => {
    setReplyToPost(null);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !thread) return;
    const contentText = replyContent.replace(/<[^>]*>/g, "");
    if (contentText.length > 5000) {
      toast.error("Balasan tidak boleh lebih dari 5.000 karakter");
      return;
    }
    setSubmitting(true);
    try {
      const payload: { content: string; parent_id?: string; attachment_ids?: number[] } = {
        content: replyContent,
      };
      
      // Add parent_id if replying to a specific post
      if (replyToPost) {
        payload.parent_id = replyToPost.id;
      }
      
      if (replyAttachmentIds.length > 0) {
        payload.attachment_ids = replyAttachmentIds;
      }

      await api.post<Post>(`/api/threads/${thread.id}/posts`, payload);
      
      // Reset form
      setReplyContent("");
      setReplyAttachmentIds([]);
      setReplyToPost(null);
      
      // Refetch posts to show the new reply
      await fetchPosts(thread.id, currentPage);
      setTotalItems((prev) => prev + 1);
      
      toast.success(replyToPost ? "Balasan berhasil dikirim" : "Balasan berhasil dikirim");
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

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const isOwner = thread?.author.username === user?.username;
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
                <Link
                  href={`/users/${thread.author.username}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={thread.author.avatar_url} />
                    <AvatarFallback>
                      {thread.author.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hover:underline">{thread.author.username}</span>
                </Link>
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

      {/* Replies Section */}
      <div id="replies-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Balasan ({totalItems})</h2>
          {totalPages > 1 && (
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
          )}
        </div>
        
        {postsLoading ? (
          // Loading skeleton for posts
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <RenderPostTree
                key={post.id}
                post={post}
                depth={0}
                postMap={postMap}
                currentUser={user}
                isAdmin={isAdmin}
                onDelete={handleDeletePost}
                onUpdate={handleUpdatePost}
                onReply={handleReplyToPost}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || postsLoading}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || postsLoading}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada balasan. Jadilah yang pertama membalas!
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Reply Form */}
      <Card id="reply-form">
        <CardContent className="pt-4">
          {/* Show who we're replying to */}
          {replyToPost && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CornerDownRight className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Membalas</span>
                  <span className="font-medium">{replyToPost.author.username}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelReplyToPost}
                  className="h-6 px-2 text-xs"
                >
                  Batal
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {replyToPost.content.replace(/<[^>]*>/g, "").slice(0, 100)}...
              </p>
            </div>
          )}
          
          <form onSubmit={handleReply} className="space-y-4">
            <TiptapEditor
              value={replyContent}
              onChange={setReplyContent}
              onAttachmentUpload={(id) => setReplyAttachmentIds((prev) => [...prev, id])}
              isLoading={submitting}
              placeholder={replyToPost ? `Balas ${replyToPost.author.username}...` : "Tulis balasan Anda..."}
            />
            <div className="text-xs text-muted-foreground text-right">
                {replyContent.replace(/<[^>]*>/g, "").length}/5000
            </div>            <div className="flex justify-end gap-2">
              {replyToPost && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelReplyToPost}
                  disabled={submitting}
                >
                  Batal Balas
                </Button>
              )}
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
                {replyToPost ? "Kirim Balasan" : "Kirim Balasan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component to recursively render post tree with DFS
function RenderPostTree({
  post,
  depth,
  postMap,
  currentUser,
  isAdmin,
  onDelete,
  onUpdate,
  onReply,
}: {
  post: Post;
  depth: number;
  postMap: Map<string, PostParent>;
  currentUser: any;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (post: Post) => void;
  onReply: (post: Post) => void;
}) {
  // Get parent post data for "replying to" indicator (only for depth >= 2)
  const parentPost = post.parent_id ? postMap.get(post.parent_id) : undefined;

  return (
    <>
      <PostItem
        post={post}
        depth={depth}
        parentPost={parentPost}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onReply={onReply}
      />
      {/* Recursively render replies */}
      {post.replies && post.replies.length > 0 && (
        <>
          {post.replies.map((reply) => (
            <RenderPostTree
              key={reply.id}
              post={reply}
              depth={depth + 1}
              postMap={postMap}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onReply={onReply}
            />
          ))}
        </>
      )}
    </>
  );
}

function PostItem({
  post,
  depth,
  parentPost,
  currentUser,
  isAdmin,
  onDelete,
  onUpdate,
  onReply,
}: {
  post: Post;
  depth: number;
  parentPost?: PostParent;
  currentUser: any;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (post: Post) => void;
  onReply: (post: Post) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [editAttachmentIds, setEditAttachmentIds] = useState<number[]>(
    (post.attachments || []).map((a) => a.id)
  );

  // Layout logic based on depth
  // depth = 0: root post, no indentation
  // depth = 1: direct reply to root, indented with left border
  // depth >= 2: nested reply, same indentation as level 1, but with "replying to" indicator
  const isIndented = depth >= 1;
  const showReplyingToIndicator = depth >= 2 && parentPost;

  useEffect(() => {
    // Sync state if prop updates
    setEditContent(post.content);
    setEditAttachmentIds((post.attachments || []).map((a) => a.id));
    setLikesCount(post.likes_count || 0);
  }, [post]);

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
  }, [post.id, post.is_liked]);

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

  const handleSave = async () => {
    if (!editContent.trim()) {
      toast.error("Konten tidak boleh kosong");
      return;
    }
    const contentText = editContent.replace(/<[^>]*>/g, "");
    if (contentText.length > 5000) {
      toast.error("Balasan tidak boleh lebih dari 5.000 karakter");
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.put<Post>(`/api/posts/${post.id}`, {
        content: editContent,
        attachment_ids: editAttachmentIds,
      });
      onUpdate(res.data);
      setIsEditing(false);
      toast.success("Balasan berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui balasan");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to get preview text from HTML content
  const getContentPreview = (content: string, maxLength: number = 50) => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Card 
      className={`
        ${isIndented ? "ml-6 sm:ml-8 border-l-2 border-primary/30" : ""}
      `}
    >
      <CardContent className="pt-4">
        {/* Reply indicator - only show for depth >= 2 */}
        {showReplyingToIndicator && (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CornerDownRight className="h-3 w-3 shrink-0 text-primary/60" />
            <span>membalas</span>
            <Link 
              href={`/users/${parentPost.author.username}`}
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              @{parentPost.author.username}
            </Link>
            <span className="hidden sm:inline text-muted-foreground/70 italic truncate max-w-[200px]">
              &ldquo;{getContentPreview(parentPost.content)}&rdquo;
            </span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 w-full">
            <Link href={`/users/${post.author.username}`}>
              <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/50 transition-all">
                <AvatarImage src={post.author.avatar_url} />
                <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Link 
                  href={`/users/${post.author.username}`}
                  className="font-medium text-sm hover:text-primary hover:underline transition-colors"
                >
                  {post.author.username}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
              
              {isEditing ? (
                 <div className="space-y-4">
                    <TiptapEditor
                      value={editContent}
                      onChange={setEditContent}
                      onAttachmentUpload={(id) => setEditAttachmentIds((prev) => [...prev, id])}
                      isLoading={isSaving}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                        {editContent.replace(/<[^>]*>/g, "").length}/5000
                      </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                            Batal
                        </Button>
                    </div>
                </div>
              ) : (
                <>
                  <div className="text-sm mt-1">
                    <RichTextDisplay content={post.content} />
                  </div>
                  {/* Post Actions (Like, Reply) */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2 gap-1.5 ${
                        liked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"
                      }`}
                      onClick={handleLike}
                    >
                      <Heart
                        className={`h-3 w-3 ${liked ? "fill-current" : ""}`}
                      />
                      <span className="text-xs">{likesCount}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-primary"
                      onClick={() => onReply(post)}
                    >
                      <Reply className="h-3 w-3" />
                      <span className="text-xs">Balas</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
          {!isEditing && (post.author.username === currentUser?.username || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 {post.author.username === currentUser?.username && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                 )}
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
