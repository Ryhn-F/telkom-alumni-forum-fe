"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";

interface FollowStatsCardProps {
  followersCount: number;
  followingCount?: number;
  showFollowing?: boolean;
}

export function FollowStatsCard({
  followersCount,
  followingCount = 0,
  showFollowing = false,
}: FollowStatsCardProps) {
  if (showFollowing) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:border-border/80 transition-colors">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{followersCount}</p>
                <p className="text-sm text-muted-foreground">Pengikut</p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-border/80 transition-colors">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{followingCount}</p>
                <p className="text-sm text-muted-foreground">Mengikuti</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{followersCount}</p>
            <p className="text-sm text-muted-foreground">Pengikut</p>
          </div>
          <Users className="h-8 w-8 text-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
}
