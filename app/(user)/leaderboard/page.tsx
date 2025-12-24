"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Info,
  Calendar,
  Infinity,
  MessageSquare,
  Heart,
  FileText,
  Zap,
  Target,
  Flame,
} from "lucide-react";
import Link from "next/link";
import type {
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardTimeframe,
} from "@/types";

// Mapping timeframe to display text
const timeframeLabels: Record<LeaderboardTimeframe, string> = {
  all_time: "🏆 Hall of Fame",
  weekly: "🔥 Trending Minggu Ini",
};

// Mapping timeframe to icon
const timeframeIcons: Record<LeaderboardTimeframe, React.ElementType> = {
  all_time: Infinity,
  weekly: Calendar,
};

// Rank colors for visual appeal
const rankColors: Record<string, { bg: string; text: string; border: string }> = {
  "Legenda": { bg: "bg-gradient-to-r from-purple-500 to-pink-500", text: "text-white", border: "border-purple-500" },
  "Sepuh": { bg: "bg-gradient-to-r from-red-500 to-orange-500", text: "text-white", border: "border-red-500" },
  "Tokoh": { bg: "bg-gradient-to-r from-yellow-500 to-amber-500", text: "text-white", border: "border-yellow-500" },
  "Aktivis": { bg: "bg-gradient-to-r from-blue-500 to-cyan-500", text: "text-white", border: "border-blue-500" },
  "Warga": { bg: "bg-gradient-to-r from-green-500 to-emerald-500", text: "text-white", border: "border-green-500" },
  "Pendatang": { bg: "bg-gradient-to-r from-gray-500 to-gray-400", text: "text-white", border: "border-gray-500" },
};

// Progress bar component
function RankProgressBar({ 
  progress, 
  currentPoints, 
  targetPoints, 
  nextRank 
}: { 
  progress: number; 
  currentPoints: number; 
  targetPoints: number; 
  nextRank: string;
}) {
  const isMaxLevel = nextRank === "Max Level" || progress >= 100;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {currentPoints.toLocaleString()} poin
        </span>
        {isMaxLevel ? (
          <span className="text-yellow-500 font-medium flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Max Level!
          </span>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1">
            <Target className="h-3 w-3" />
            {(targetPoints - currentPoints).toLocaleString()} poin lagi untuk menjadi {nextRank}
          </span>
        )}
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isMaxLevel 
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 animate-pulse" 
              : "bg-gradient-to-r from-primary to-primary/70"
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>(
    tabParam === "weekly" ? "weekly" : "all_time"
  );

  const fetchLeaderboard = async (tf: LeaderboardTimeframe) => {
    setLoading(true);
    try {
      const res = await api.get<LeaderboardResponse>("/api/leaderboard", {
        params: { timeframe: tf, limit: 20 },
      });
      setLeaderboard(res.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch leaderboard:", error);
      toast.error("Gagal memuat leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe]);

  // Get rank badge/icon based on position
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30">
            <Medal className="h-5 w-5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/30">
            <Medal className="h-5 w-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="font-semibold text-muted-foreground">{rank}</span>
          </div>
        );
    }
  };

  // Card background styling for top 3
  const getCardStyle = (rank: number): string => {
    switch (rank) {
      case 1:
        return "border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-background to-background hover:shadow-yellow-500/10";
      case 2:
        return "border-slate-400/50 bg-gradient-to-r from-slate-400/10 via-background to-background hover:shadow-slate-400/10";
      case 3:
        return "border-amber-600/50 bg-gradient-to-r from-amber-600/10 via-background to-background hover:shadow-amber-600/10";
      default:
        return "border-border/50 hover:border-border";
    }
  };

  // Get rank badge with color
  const getRankBadge = (rankName: string) => {
    const colors = rankColors[rankName] || rankColors["Pendatang"];
    return (
      <Badge className={`${colors.bg} ${colors.text} border-0 gap-1`}>
        <Zap className="h-3 w-3" />
        {rankName}
      </Badge>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground">
          Pengguna paling aktif dan berkontribusi di forum
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div>
              <CardDescription className="mt-1">
                Dapatkan poin dari aktivitas positif di forum. Semakin aktif,
                semakin tinggi peringkatmu!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Info className="h-4 w-4" />
                📊 Cara Mendapatkan Poin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogTitle>
                <DialogDescription>
                  Berikut adalah cara mendapatkan poin di forum ini.
                </DialogDescription>
              </DialogTitle>
              <div className="space-y-6 pt-4">
                {/* Point Table */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Tabel Poin
                  </h4>
                  <div className="space-y-3">
                    {/* Create Thread */}
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Buat Thread</h5>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-600 border-green-500/30"
                          >
                            +2 Poin
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dibatasi maksimal <strong>3 thread per hari</strong>.
                          Thread ke-4 dan seterusnya tidak mendapat poin.
                        </p>
                      </div>
                    </div>

                    {/* Like Received */}
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Mendapat Like</h5>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-600 border-green-500/30"
                          >
                            +10 Poin
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Kamu mendapat poin jika thread atau postinganmu
                          di-like oleh user lain. Like sendiri tidak dihitung.
                        </p>
                      </div>
                    </div>

                    {/* Comment Received */}
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Mendapat Komentar</h5>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-600 border-green-500/30"
                          >
                            +5 Poin
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Kamu mendapat poin jika thread atau postinganmu
                          dikomentari oleh user lain.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rank Tiers */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Tingkatan Rank
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: "Pendatang", range: "0 - 99", icon: "🌱" },
                      { name: "Warga", range: "100 - 599", icon: "🏠" },
                      { name: "Aktivis", range: "600 - 2.999", icon: "⚡" },
                      { name: "Tokoh", range: "3.000 - 7.999", icon: "🌟" },
                      { name: "Sepuh", range: "8.000 - 19.999", icon: "🔥" },
                      { name: "Legenda", range: "20.000+", icon: "👑" },
                    ].map((tier) => (
                      <div
                        key={tier.name}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-lg">{tier.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{tier.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tier.range} poin
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Timeframe Tabs */}
      <Tabs
        value={timeframe}
        onValueChange={(v) => setTimeframe(v as LeaderboardTimeframe)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          {(
            Object.entries(timeframeLabels) as [LeaderboardTimeframe, string][]
          ).map(([key, label]) => {
            const Icon = timeframeIcons[key];
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">
                  {key === "all_time" ? "Hall of Fame" : "Trending"}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Leaderboard List */}
      <div className="space-y-3 animate-stagger">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="hover-lift">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : leaderboard.length > 0 ? (
          leaderboard.map((entry) => {
            const rank = entry.position;
            const gs = entry.gamification_status;

            return (
              <Card
                key={entry.username}
                className={`hover-lift transition-all duration-300 ${getCardStyle(
                  rank
                )}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="pt-1">
                      {getRankDisplay(rank)}
                    </div>

                    {/* Avatar */}
                    <Link href={`/users/${entry.username}`}>
                      <Avatar className="h-12 w-12 ring-2 ring-background hover:ring-primary/50 transition-all cursor-pointer">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {entry.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* User Info + Progress */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/users/${entry.username}`}
                            className="hover:underline"
                          >
                            <h3 className="font-semibold truncate">
                              @{entry.username}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {getRankBadge(gs.rank_name)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {entry.role}
                            </span>
                            {/* Show weekly label in weekly mode */}
                            {timeframe === "weekly" && gs.weekly_label && (
                              <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/30">
                                {gs.weekly_label}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Score on right side for larger screens */}
                        <div className="hidden sm:block text-right shrink-0">
                          <div className="flex items-center gap-1.5">
                            {timeframe === "weekly" ? (
                              <Flame className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Sparkles
                                className={`h-4 w-4 ${
                                  rank === 1
                                    ? "text-yellow-500"
                                    : rank === 2
                                    ? "text-slate-400"
                                    : rank === 3
                                    ? "text-amber-600"
                                    : "text-muted-foreground"
                                }`}
                              />
                            )}
                            <span
                              className={`font-bold text-lg ${
                                timeframe === "weekly"
                                  ? "text-orange-600"
                                  : rank === 1
                                  ? "text-yellow-500"
                                  : rank === 2
                                  ? "text-slate-400"
                                  : rank === 3
                                  ? "text-amber-600"
                                  : ""
                              }`}
                            >
                              {timeframe === "weekly" 
                                ? `+${(gs.weekly_points || 0).toLocaleString()}`
                                : gs.current_points.toLocaleString()
                              }
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {timeframe === "weekly" ? "minggu ini" : "poin all-time"}
                          </p>
                        </div>
                      </div>

                      {/* Show progress bar only in all_time mode */}
                      {timeframe === "all_time" && (
                        <RankProgressBar
                          progress={gs.progress}
                          currentPoints={gs.current_points}
                          targetPoints={gs.target_points}
                          nextRank={gs.next_rank}
                        />
                      )}
                      
                      {/* Show weekly stats in weekly mode */}
                      {timeframe === "weekly" && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {gs.current_points.toLocaleString()} poin all-time
                          </span>
                          {gs.weekly_points !== undefined && gs.weekly_points > 0 && (
                            <span className="text-orange-600 font-medium">
                              +{gs.weekly_points.toLocaleString()} poin minggu ini
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">
                Belum ada data leaderboard
              </p>
              <p className="text-sm mt-1">
                Mulai berkontribusi untuk muncul di leaderboard!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer info */}
      {!loading && leaderboard.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>
            Menampilkan {leaderboard.length} pengguna teratas{" "}
            {timeframeLabels[timeframe].toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
