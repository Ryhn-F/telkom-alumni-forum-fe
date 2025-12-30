// ==================== Reactions ====================
export interface ReactionCounts {
  [emoji: string]: number;
}

export interface Reactions {
  counts: ReactionCounts;
  user_reacted: string | null; // Single emoji or null (user can only have ONE reaction)
}

export interface ToggleReactionRequest {
  reference_id: string;
  reference_type: "thread" | "post" | "menfess";
  emoji: string;
}
