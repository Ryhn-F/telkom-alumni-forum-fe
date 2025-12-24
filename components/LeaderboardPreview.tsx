"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Crown, Medal, Flame, ArrowRight, Zap, Sparkles } from "lucide-react";
import type { LeaderboardEntry, LeaderboardResponse, LeaderboardTimeframe } from "@/types";

// Rank colors
const rankColors: Record<string, string> = {
  "Legenda": "bg-gradient-to-r from-purple-500 to-pink-500",
  "Sepuh": "bg-gradient-to-r from-red-500 to-orange-500",
  "Tokoh": "bg-gradient-to-r from-yellow-500 to-amber-500",
  "Aktivis": "bg-gradient-to-r from-blue-500 to-cyan-500",
  "Warga": "bg-gradient-to-r from-green-500 to-emerald-500",
  "Pendatang": "bg-gradient-to-r from-gray-500 to-gray-400",
};

const rankEmoji: Record<string, string> = {
  "Legenda": "👑",
  "Sepuh": "🔥",
  "Tokoh": "🌟",
  "Aktivis": "⚡",
  "Warga": "🏠",
  "Pendatang": "🌱",
};

function TopUserCard({ 
  entry, 
  rank, 
  mode 
}: { 
  entry: LeaderboardEntry; 
  rank: number;
  mode: LeaderboardTimeframe;
}) {
  const gs = entry.gamification_status;
  const emoji = rankEmoji[gs.rank_name] || "🌱";
  
  // Medal/badge for position
  const getPositionBadge = () => {
    switch (rank) {
      case 1:
        return (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
            <Crown className="h-3 w-3 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg">
            <Medal className="h-3 w-3 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg">
            <Medal className="h-3 w-3 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Link href={`/users/${entry.username}`} className="block">
      <div className="flex flex-col items-center p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group">
        {/* Avatar with position badge */}
        <div className="relative mb-2">
          <Avatar className={`h-14 w-14 ring-2 ${rank === 1 ? "ring-yellow-500" : rank === 2 ? "ring-slate-400" : rank === 3 ? "ring-amber-600" : "ring-border"} group-hover:ring-primary/50 transition-all`}>
            <AvatarImage src={entry.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {entry.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {getPositionBadge()}
        </div>

        {/* Username */}
        <p className="font-semibold text-sm truncate max-w-full text-center group-hover:text-primary transition-colors">
          @{entry.username}
        </p>

        {/* Rank Badge */}
        <Badge className={`${rankColors[gs.rank_name] || "bg-muted"} text-white border-0 gap-0.5 text-xs mt-1`}>
          <span>{emoji}</span>
          {gs.rank_name}
        </Badge>

        {/* Points */}
        <div className="flex items-center gap-1 mt-2 text-xs">
          {mode === "weekly" ? (
            <>
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="font-bold text-orange-600">+{(gs.weekly_points || 0).toLocaleString()}</span>
            </>
          ) : (
            <>
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-bold">{gs.current_points.toLocaleString()}</span>
            </>
          )}
        </div>
        
        {/* Weekly label */}
        {mode === "weekly" && gs.weekly_label && (
          <span className="text-xs mt-1 text-orange-600">{gs.weekly_label}</span>
        )}
      </div>
    </Link>
  );
}

export function LeaderboardPreview() {
  const [weeklyTop, setWeeklyTop] = useState<LeaderboardEntry[]>([]);
  const [allTimeTop, setAllTimeTop] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [weeklyRes, allTimeRes] = await Promise.all([
          api.get<LeaderboardResponse>("/api/leaderboard", { params: { timeframe: "weekly", limit: 3 } }),
          api.get<LeaderboardResponse>("/api/leaderboard", { params: { timeframe: "all_time", limit: 3 } }),
        ]);
        setWeeklyTop(weeklyRes.data.data || []);
        setAllTimeTop(allTimeRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-around">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly Trending */}
      <Card className="overflow-hidden border-orange-500/20">
        <CardHeader className="pb-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-5 w-5 text-orange-500" />
              🔥 Trending Minggu Ini
            </CardTitle>
            <Link href="/leaderboard?tab=weekly">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Lihat Semua
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {weeklyTop.length > 0 ? (
            <div className="flex justify-around">
              {weeklyTop.map((entry, index) => (
                <TopUserCard 
                  key={entry.username} 
                  entry={entry} 
                  rank={index + 1}
                  mode="weekly"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Belum ada aktivitas minggu ini
            </p>
          )}
        </CardContent>
      </Card>

      {/* All-Time Hall of Fame */}
      <Card className="overflow-hidden border-yellow-500/20">
        <CardHeader className="pb-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-yellow-500" />
              🏆 Hall of Fame
            </CardTitle>
            <Link href="/leaderboard?tab=all_time">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Lihat Semua
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {allTimeTop.length > 0 ? (
            <div className="flex justify-around">
              {allTimeTop.map((entry, index) => (
                <TopUserCard 
                  key={entry.username} 
                  entry={entry} 
                  rank={index + 1}
                  mode="all_time"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Belum ada data leaderboard
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
