"use client";

import { useState, useRef, useCallback } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Reactions, ToggleReactionRequest } from "@/types/reactions";

interface ReactionBarProps {
  referenceId: string;
  referenceType: "thread" | "post" | "menfess";
  reactions: Reactions;
  onReactionsChange?: (reactions: Reactions) => void;
  className?: string;
}

export function ReactionBar({
  referenceId,
  referenceType,
  reactions,
  onReactionsChange,
  className,
}: ReactionBarProps) {
  const [localReactions, setLocalReactions] = useState<Reactions>(reactions);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Sync with parent when reactions prop changes
  const prevReactionsRef = useRef(reactions);
  if (reactions !== prevReactionsRef.current) {
    prevReactionsRef.current = reactions;
    setLocalReactions(reactions);
  }

  const toggleReaction = useCallback(
    async (newEmoji: string) => {
      if (isPending) return;

      const previousReactions = {
        ...localReactions,
        counts: { ...localReactions.counts },
      };
      const currentEmoji = localReactions.user_reacted;

      // Optimistic update
      const newCounts = { ...localReactions.counts };
      let newUserReacted: string | null;

      if (currentEmoji === newEmoji) {
        // Case 1: Clicking same emoji - remove reaction
        newCounts[newEmoji] = Math.max((newCounts[newEmoji] || 1) - 1, 0);
        if (newCounts[newEmoji] === 0) delete newCounts[newEmoji];
        newUserReacted = null;
      } else {
        // Case 2: Clicking different emoji - replace reaction
        if (currentEmoji) {
          // Decrement old emoji count
          newCounts[currentEmoji] = Math.max(
            (newCounts[currentEmoji] || 1) - 1,
            0
          );
          if (newCounts[currentEmoji] === 0) delete newCounts[currentEmoji];
        }
        // Increment new emoji count
        newCounts[newEmoji] = (newCounts[newEmoji] || 0) + 1;
        newUserReacted = newEmoji;
      }

      const optimisticReactions: Reactions = {
        counts: newCounts,
        user_reacted: newUserReacted,
      };

      setLocalReactions(optimisticReactions);
      onReactionsChange?.(optimisticReactions);
      setIsPending(true);

      try {
        const payload: ToggleReactionRequest = {
          reference_id: referenceId,
          reference_type: referenceType,
          emoji: newEmoji,
        };
        await api.post("/api/reactions", payload);
      } catch {
        // Rollback on error
        setLocalReactions(previousReactions);
        onReactionsChange?.(previousReactions);
        toast.error("Gagal memproses reaksi");
      } finally {
        setIsPending(false);
      }
    },
    [localReactions, referenceId, referenceType, onReactionsChange, isPending]
  );

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setPickerOpen(false);
    toggleReaction(emojiData.emoji);
  };

  const sortedEmojis = Object.entries(localReactions.counts).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {sortedEmojis.map(([emoji, count]) => {
        const isActive = localReactions.user_reacted === emoji;

        return (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => toggleReaction(emoji)}
            className={cn(
              "h-7 px-2 gap-1 text-sm transition-all",
              isActive &&
                "bg-primary/10 border-primary text-primary hover:bg-primary/20",
              isPending && "opacity-70"
            )}
          >
            <span>{emoji}</span>
            <span className="text-xs font-medium">{count}</span>
          </Button>
        );
      })}

      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="h-7 w-7 p-0 rounded-full"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0" align="start">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme={Theme.AUTO}
            width={320}
            height={400}
            searchPlaceholder="Cari emoji..."
            previewConfig={{ showPreview: false }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
