"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { api } from "@/lib/axios";
import { getToken } from "@/lib/cookies";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TiptapEditor } from "@/components/TiptapEditor";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import type { Thread } from "@/types";

interface InlinePostComposerProps {
  onPostCreated?: (newThread?: Thread) => void;
}

export function InlinePostComposer({ onPostCreated }: InlinePostComposerProps) {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState("");
  const [attachmentIDs, setAttachmentIDs] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !!user && !!getToken();

  // If not logged in or not mounted yet (to prevent SSR hydration mismatch), hide PostComposer
  if (!mounted || !isLoggedIn) {
    return null;
  }

  const handleAttachmentUpload = (id: number) => {
    setAttachmentIDs((prev) => [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/threads");
      return;
    }

    const strippedText = content.replace(/<[^>]*>/g, "").trim();
    if (!strippedText && attachmentIDs.length === 0) {
      toast.error("Tulis pesan atau tambahkan gambar sebelum mengirim");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Mengirim postingan...");

    try {
      await api.post("/api/threads", {
        content,
        attachment_ids: attachmentIDs,
      });

      toast.dismiss(loadingToast);
      toast.success("Postingan berhasil diterbitkan!");

      setContent("");
      setAttachmentIDs([]);

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err: unknown) {
      console.error(err);
      toast.dismiss(loadingToast);
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Gagal membuat postingan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormEmpty = !content.replace(/<[^>]*>/g, "").trim() && attachmentIDs.length === 0;

  return (
    <Card className="rounded-2xl border border-border/70 shadow-xs hover:border-border/90 transition-all bg-card overflow-hidden mb-6">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-3 md:gap-4">
          {/* User Avatar */}
          <Avatar className="h-10 w-10 md:h-11 md:w-11 border border-primary/10 shrink-0">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-red-50 text-red-600 font-bold text-sm">
              {(profile?.full_name || user?.username || "A")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Composer Body */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {profile?.full_name || user.username}
              </span>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            </div>

            {/* RichText Editor with placeholder */}
            <TiptapEditor
              value={content}
              onChange={setContent}
              onAttachmentUpload={handleAttachmentUpload}
              isLoading={isSubmitting}
              placeholder="Apa yang ingin Anda bagikan atau tanyakan saat ini?..."
              className="min-h-[90px] border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm md:text-base placeholder:text-muted-foreground/70"
            />

            {/* Bottom Actions Bar */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isFormEmpty}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 h-9 rounded-full shadow-sm gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Posting</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
