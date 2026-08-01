"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toggleFollow } from "@/lib/follow";
import { useAuthStore } from "@/stores";
import { getToken } from "@/lib/cookies";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUsername: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean, newFollowersCount?: number) => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function FollowButton({
  targetUsername,
  initialIsFollowing = false,
  onFollowChange,
  className,
  size = "default",
}: FollowButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show follow button for self
  if (user?.username === targetUsername) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (!getToken()) {
      toast.info("Silakan masuk untuk mengikuti pengguna");
      router.push(`/login?redirect=/users/${targetUsername}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await toggleFollow(targetUsername, isFollowing);
      setIsFollowing(res.is_following);
      if (onFollowChange) {
        onFollowChange(res.is_following);
      }
      toast.success(
        res.is_following
          ? `Sekarang mengikuti @${targetUsername}`
          : `Batal mengikuti @${targetUsername}`
      );
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.status === 429) {
        toast.error("Batas aksi tercapai. Silakan coba beberapa saat lagi.");
      } else {
        toast.error(error.response?.data?.error || "Gagal mengubah status ikuti");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={size}
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={cn(
        "gap-2 font-semibold shadow-xs transition-all cursor-pointer",
        isFollowing
          ? "border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          : "bg-red-600 hover:bg-red-700 text-white",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 text-red-500" />
          <span>Mengikuti</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Ikuti</span>
        </>
      )}
    </Button>
  );
}
