"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Target, Crown, Trophy, TrendingUp, Flame } from "lucide-react";
import type { GamificationStatus } from "@/types";

// Rank colors for visual appeal
const rankColors: Record<string, { bg: string; text: string; glow: string }> = {
  "Legenda": { 
    bg: "bg-gradient-to-r from-purple-500 to-pink-500", 
    text: "text-white", 
    glow: "shadow-purple-500/30" 
  },
  "Sepuh": { 
    bg: "bg-gradient-to-r from-red-500 to-orange-500", 
    text: "text-white", 
    glow: "shadow-red-500/30" 
  },
  "Tokoh": { 
    bg: "bg-gradient-to-r from-yellow-500 to-amber-500", 
    text: "text-white", 
    glow: "shadow-yellow-500/30" 
  },
  "Aktivis": { 
    bg: "bg-gradient-to-r from-blue-500 to-cyan-500", 
    text: "text-white", 
    glow: "shadow-blue-500/30" 
  },
  "Warga": { 
    bg: "bg-gradient-to-r from-green-500 to-emerald-500", 
    text: "text-white", 
    glow: "shadow-green-500/30" 
  },
  "Pendatang": { 
    bg: "bg-muted", 
    text: "text-muted-foreground", 
    glow: "" 
  },
};

// Rank emoji icons
const rankEmoji: Record<string, string> = {
  "Legenda": "👑",
  "Sepuh": "🔥",
  "Tokoh": "🌟",
  "Aktivis": "⚡",
  "Warga": "🏠",
  "Pendatang": "🌱",
};

interface GamificationCardProps {
  gamificationStatus: GamificationStatus;
  variant?: "full" | "compact";
  showLeaderboardLink?: boolean;
}

export function GamificationCard({ 
  gamificationStatus, 
  variant = "full",
  showLeaderboardLink = true 
}: GamificationCardProps) {
  const gs = gamificationStatus;
  const colors = rankColors[gs.rank_name] || rankColors["Pendatang"];
  const emoji = rankEmoji[gs.rank_name] || "🌱";
  const isMaxLevel = gs.next_rank === "Max Level" || gs.progress >= 100;
  const clampedProgress = Math.min(100, Math.max(0, gs.progress));

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Badge className={`${colors.bg} ${colors.text} border-0 gap-1 shadow-lg ${colors.glow}`}>
          <span>{emoji}</span>
          {gs.rank_name}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>{gs.current_points.toLocaleString()} poin</span>
        </div>
        {gs.weekly_label && (
          <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
            {gs.weekly_label}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${colors.bg} shadow-lg ${colors.glow}`}>
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{emoji}</span>
                <h3 className="font-bold text-lg">{gs.rank_name}</h3>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>{gs.current_points.toLocaleString()} poin all-time</span>
              </div>
            </div>
          </div>
          {showLeaderboardLink && (
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className="gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Weekly Activity Banner */}
        {(gs.weekly_points !== undefined || gs.weekly_label) && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Aktivitas Minggu Ini</span>
              </div>
              <div className="flex items-center gap-2">
                {gs.weekly_points !== undefined && (
                  <span className="text-sm font-bold text-orange-600">
                    +{gs.weekly_points.toLocaleString()} poin
                  </span>
                )}
                {gs.weekly_label && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                    {gs.weekly_label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress ke rank berikutnya</span>
            <span className="font-medium">{clampedProgress.toFixed(0)}%</span>
          </div>
          
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isMaxLevel 
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500" 
                  : "bg-gradient-to-r from-primary to-primary/70"
              }`}
              style={{ width: `${clampedProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{gs.current_points.toLocaleString()} poin</span>
            {isMaxLevel ? (
              <span className="text-yellow-500 font-medium flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Max Level Tercapai!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {(gs.target_points - gs.current_points).toLocaleString()} poin lagi untuk menjadi {gs.next_rank}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact badge for displaying in headers/cards
export function RankBadge({ rankName }: { rankName: string }) {
  const colors = rankColors[rankName] || rankColors["Pendatang"];
  const emoji = rankEmoji[rankName] || "🌱";
  
  return (
    <Badge className={`${colors.bg} ${colors.text} border-0 gap-1`}>
      <span>{emoji}</span>
      {rankName}
    </Badge>
  );
}

// Weekly activity badge
export function WeeklyActivityBadge({ 
  weeklyPoints, 
  weeklyLabel 
}: { 
  weeklyPoints?: number; 
  weeklyLabel?: string;
}) {
  if (!weeklyPoints && !weeklyLabel) return null;
  
  return (
    <div className="flex items-center gap-2">
      {weeklyPoints !== undefined && weeklyPoints > 0 && (
        <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
          <Flame className="h-3 w-3" />
          +{weeklyPoints.toLocaleString()} minggu ini
        </Badge>
      )}
      {weeklyLabel && (
        <span className="text-sm">{weeklyLabel}</span>
      )}
    </div>
  );
}
