"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchStore } from "@/stores";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  X,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { MeilisearchThread, MeilisearchPost } from "@/types";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function highlightText(text: string): React.ReactNode {
  // Split by <mark> tags and create highlighted spans
  const parts = text.split(/(<mark>.*?<\/mark>)/g);
  return parts.map((part, index) => {
    if (part.startsWith("<mark>") && part.endsWith("</mark>")) {
      const content = part.slice(6, -7);
      return (
        <mark key={index} className="bg-primary/30 text-foreground rounded px-0.5">
          {content}
        </mark>
      );
    }
    return <span key={index}>{stripHtml(part)}</span>;
  });
}

function ThreadResult({ thread }: { thread: MeilisearchThread }) {
  const formatted = thread._formatted;
  
  return (
    <Link href={`/threads/${thread.slug}`} className="block">
      <div className="group p-4 hover:bg-muted/50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-border">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {formatted?.title ? highlightText(formatted.title) : thread.title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {formatted?.content ? highlightText(stripHtml(formatted.content)) : stripHtml(thread.content).slice(0, 150)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {thread.category?.name || "Kategori"}
              </Badge>
              <span className="text-xs text-muted-foreground">oleh {thread.user?.username || "Anonim"}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}

function PostResult({ post }: { post: MeilisearchPost }) {
  const formatted = post._formatted;
  
  return (
    <Link href={`/threads/${post.thread_slug}`} className="block">
      <div className="group p-4 hover:bg-muted/50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-border">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-secondary text-secondary-foreground shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">
              Balasan di: <span className="text-foreground font-medium">{post.thread_title}</span>
            </p>
            <p className="text-sm line-clamp-2">
              {formatted?.content ? highlightText(stripHtml(formatted.content)) : stripHtml(post.content).slice(0, 150)}
            </p>
            <span className="text-xs text-muted-foreground mt-1 inline-block">
              oleh {post.user?.username || "Anonim"}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState("");
  const {
    threads,
    posts,
    isSearching,
    error,
    search,
    clearResults,
  } = useSearchStore();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim()) {
        search(localQuery);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, search, clearResults]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle keyboard shortcut to open search
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Trigger open from parent
        }
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setLocalQuery("");
    clearResults();
    onClose();
  }, [clearResults, onClose]);

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(localQuery)}`);
    handleClose();
  };

  const hasResults = (threads && threads.results.length > 0) || (posts && posts.hits.length > 0);
  const hasQuery = localQuery.trim().length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-[10%] -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <Card className="shadow-2xl border-2">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Cari diskusi atau balasan..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 text-base"
              />
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10">
                  {error}
                </div>
              )}

              {isSearching && !threads && !posts && (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasQuery && !isSearching && !hasResults && (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Tidak ada hasil untuk &quot;{localQuery}&quot;
                  </p>
                </div>
              )}

              {threads && threads.results.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Diskusi ({threads.total})
                  </div>
                  {threads.results.slice(0, 3).map((thread: MeilisearchThread) => (
                    <div key={thread.id} onClick={handleClose}>
                      <ThreadResult thread={thread} />
                    </div>
                  ))}
                </div>
              )}

              {posts && posts.hits.length > 0 && (
                <div className="p-2 border-t">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Balasan ({posts.estimatedTotalHits})
                  </div>
                  {posts.hits.slice(0, 3).map((post: MeilisearchPost) => (
                    <div key={post.id} onClick={handleClose}>
                      <PostResult post={post} />
                    </div>
                  ))}
                </div>
              )}

              {hasResults && (
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewAll}
                  >
                    Lihat semua hasil
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Tekan <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd> untuk menutup
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">K</kbd> untuk pencarian cepat
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Cari diskusi...</span>
        <span className="inline-flex lg:hidden">Cari...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
