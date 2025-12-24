"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Bell, Check, CheckCheck, MessageSquare, Heart, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores";
import type { Notification } from "@/types";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    connectWebSocket,
    disconnectWebSocket,
  } = useNotificationStore();

  // Deduplicate notifications to prevent duplicate key errors
  const uniqueNotifications = useMemo(() => {
    const seen = new Set<string>();
    return notifications.filter((notification) => {
      if (seen.has(notification.id)) {
        return false;
      }
      seen.add(notification.id);
      return true;
    });
  }, [notifications]);

  // Initialize WebSocket connection and fetch initial data
  useEffect(() => {
    connectWebSocket();
    fetchUnreadCount();
    fetchNotifications();

    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket, fetchNotifications, fetchUnreadCount]);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like_thread":
      case "like_post":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "reply_thread":
      case "reply_post":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "rank_up":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    // Handle gamification notifications
    if (notification.entity_type === "gamification" || notification.type === "rank_up") {
      return `/profile`;
    }
    // Navigate to thread using slug
    if (notification.entity_slug) {
      return `/threads/${notification.entity_slug}`;
    }
    // Fallback to threads list if no slug available
    return `/threads`;
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: id,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tandai semua dibaca
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          <>
            {uniqueNotifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                asChild
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !notification.is_read && "bg-muted/50"
                )}
              >
                <Link
                  href={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={notification.actor?.avatar_url} />
                      <AvatarFallback>
                        {notification.actor?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <p className="text-sm font-medium truncate">
                          {notification.type === "rank_up" ? "Sistem" : (notification.actor?.username || "Seseorang")}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                    )}
                    {notification.is_read && (
                      <Check className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}

            {uniqueNotifications.length > 10 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center">
                  <Link
                    href="/notifications"
                    className="text-sm text-primary hover:underline"
                  >
                    Lihat semua notifikasi
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
