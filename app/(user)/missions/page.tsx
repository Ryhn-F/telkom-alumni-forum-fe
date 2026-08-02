"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, CheckCircle2, ListChecks, Trophy } from "lucide-react";
import { claimMission, getMissions } from "@/lib/mission";
import { useWalletStore } from "@/stores/wallet-store";
import type { Mission } from "@/types";

function MissionRow({ mission, onClaimed }: { mission: Mission; onClaimed: (m: Mission) => void }) {
  const [claiming, setClaiming] = useState(false);
  const setBalance = useWalletStore((s) => s.setBalance);
  const progressPct = Math.min(100, Math.round((mission.progress / mission.target) * 100));

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await claimMission(mission.id);
      setBalance(res.new_balance);
      toast.success(`+${res.reward} TC diklaim!`);
      onClaimed(mission);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Gagal klaim misi");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{mission.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="h-1.5 flex-1 max-w-40 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {Math.min(mission.progress, mission.target)}/{mission.target}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-400 border-amber-500/30">
          <Coins className="h-3 w-3" />
          {mission.reward} TC
        </Badge>
        {mission.status === "claimed" ? (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Diklaim
          </Badge>
        ) : (
          <Button
            size="sm"
            disabled={mission.status !== "claimable" || claiming}
            onClick={handleClaim}
          >
            {claiming ? "..." : "Klaim"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setMissions(await getMissions());
    } catch {
      toast.error("Gagal memuat misi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClaimed = () => {
    load();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const daily = missions.filter((m) => m.kind === "daily");
  const achievements = missions.filter((m) => m.kind === "achievement");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Misi & Pencapaian</h1>
        <p className="text-sm text-muted-foreground">
          Selesaikan misi untuk mendapatkan Tel-Credits (TC), dipakai buat beli kosmetik di Toko.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4" />
            Misi Harian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {daily.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada misi harian aktif.</p>
          ) : (
            daily.map((m) => <MissionRow key={m.id} mission={m} onClaimed={handleClaimed} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4" />
            Pencapaian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada pencapaian aktif.</p>
          ) : (
            achievements.map((m) => <MissionRow key={m.id} mission={m} onClaimed={handleClaimed} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
