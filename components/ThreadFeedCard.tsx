"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye, Share2, ChevronDown, ChevronUp, UserCheck } from "lucide-react";
import { ReactionBar } from "@/components/ReactionBar";
import { RichTextDisplay } from "@/components/RichTextDisplay";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useThreadViewTracker } from "@/hooks/useThreadViewTracker";
import type { Thread, Reactions } from "@/types";

interface ThreadFeedCardProps {
  thread: Thread;
  onReactionsChange?: (reactions: Reactions) => void;
}

function cleanContentForFeed(html: string): string {
  if (!html) return "";
  // Strip img tags inside body so featured image is shown cleanly above/below without duplication
  return html.replace(/<img[^>]*>/gi, "");
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}j lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}h lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function ThreadFeedCard({ thread, onReactionsChange }: ThreadFeedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useThreadViewTracker({ threadId: thread.id, delayMs: 1000, threshold: 0.5 });
  const cleanedHtml = cleanContentForFeed(thread.content);

  const plainTextContent = cleanedHtml.replace(/<[^>]*>/g, "").trim();
  const hasDistinctTitle =
    !!thread.title &&
    thread.title.trim() !== "" &&
    thread.title.trim() !== plainTextContent;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/threads/${thread.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Tautan diskusi berhasil disalin!");
    } else {
      toast.info(`Tautan: ${url}`);
    }
  };

  const handleCardClick = () => {
    // Save scroll position in sessionStorage before navigating
    if (typeof window !== "undefined") {
      sessionStorage.setItem("feed_scroll_position", window.scrollY.toString());
    }
  };

  return (
    <article
      ref={cardRef}
      className="bg-card hover:bg-muted/20 border border-border/60 hover:border-border/80 rounded-2xl p-4 md:p-5 transition-all duration-200 shadow-xs space-y-3 group"
    >
      {/* Followed Unseen Badge Indicator */}
      {thread.is_followed_unseen && (
        <div className="flex items-center gap-1.5 mb-1">
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold gap-1 px-2 py-0.5 rounded-full">
            <UserCheck className="h-3 w-3" />
            <span>Dari orang yang Anda ikuti</span>
          </Badge>
        </div>
      )}

      {/* Header: Author & Metadata */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/users/${thread.author.username}`}
          onClick={handleCardClick}
          className="flex items-center gap-3 group/author"
        >
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src={thread.author.avatar_url} />
            <AvatarFallback className="bg-red-50 text-red-600 font-bold text-xs">
              {(thread.author.username || "A")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground group-hover/author:underline truncate">
                {thread.author.username}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                {thread.category_name || "Umum"}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              @{thread.author.username} • {formatRelativeTime(thread.created_at)}
            </span>
          </div>
        </Link>
      </div>

      {/* Title (Only shown if distinct title was provided) & Body Content */}
      <div className="space-y-2">
        {hasDistinctTitle && (
          <Link href={`/threads/${thread.slug}`} onClick={handleCardClick}>
            <h2 className="text-base md:text-lg font-bold text-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors leading-snug">
              {thread.title}
            </h2>
          </Link>
        )}

        {/* Rich Text Display with formatting preserved */}
        <div className={cn("relative transition-all duration-300 overflow-hidden", !isExpanded && "max-h-[140px]")}>
          <RichTextDisplay content={cleanedHtml} compact />
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card via-card/70 to-transparent pointer-events-none" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer z-10 relative"
        >
          {isExpanded ? (
            <>
              <span>Ciutkan</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <span>Lihat Selengkapnya...</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Featured Image (First Image attached/embedded) */}
      {thread.image_url && (
        <Link href={`/threads/${thread.slug}`} onClick={handleCardClick} className="block">
          <div className="relative rounded-2xl overflow-hidden border border-border/40 max-h-[380px] bg-muted/30 my-2 group-hover:border-border transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thread.image_url}
              alt={thread.title || "Post image"}
              className="w-full h-full object-cover max-h-[380px] group-hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      {/* Bottom Action Bar (Twitter Style) */}
      <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {/* Reaction Bar */}
          <ReactionBar
            referenceId={thread.id}
            referenceType="thread"
            reactions={thread.reactions || { counts: {}, user_reacted: null }}
            onReactionsChange={onReactionsChange}
          />

          {/* Comment Count */}
          <Link
            href={`/threads/${thread.slug}#reply-form`}
            onClick={handleCardClick}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors py-1 px-2 rounded-lg hover:bg-muted/60"
          >
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{thread.reply_count || 0}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Views */}
          <div className="flex items-center gap-1.5 text-muted-foreground/80">
            <Eye className="h-3.5 w-3.5" />
            <span>{thread.views || 0}</span>
          </div>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
            title="Bagikan Tautan"
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
