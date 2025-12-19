import { create } from "zustand";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { getToken } from "@/lib/cookies";
import type {
  Notification,
  NotificationListResponse,
  NotificationUnreadCountResponse,
} from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  socket: WebSocket | null;

  // Actions
  fetchNotifications: (limit?: number, offset?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification, showToast?: boolean) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  clearNotifications: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper to get WS URL from API URL
const getWebSocketUrl = () => {
  const url = API_BASE_URL.replace(/^http/, "ws");
  return `${url}/api/notifications/ws`;
};

// Helper to get notification title based on type
const getNotificationTitle = (type: Notification["type"]) => {
  switch (type) {
    case "like_thread":
      return "❤️ Like Baru";
    case "like_post":
      return "❤️ Like Baru";
    case "reply_thread":
      return "💬 Balasan Baru";
    case "reply_post":
      return "💬 Balasan Baru";
    default:
      return "🔔 Notifikasi";
  }
};

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isConnected: false,
  error: null,
  socket: null,

  fetchNotifications: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<NotificationListResponse>(
        `/api/notifications?limit=${limit}&offset=${offset}`
      );
      set({ notifications: response.data.data || [], isLoading: false });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ error: "Failed to fetch notifications", isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get<NotificationUnreadCountResponse>(
        "/api/notifications/unread-count"
      );
      set({ unreadCount: response.data.count });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put("/api/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  addNotification: (notification: Notification, showToast = true) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Show toast for real-time notifications
    if (showToast) {
      toast(getNotificationTitle(notification.type), {
        description: notification.message,
        action: {
          label: "Lihat",
          onClick: () => {
            // Navigate to thread using slug
            if (notification.entity_slug) {
              window.location.href = `/threads/${notification.entity_slug}`;
            }
          },
        },
      });
    }
  },

  connectWebSocket: () => {
    const token = getToken();
    if (!token) {
      console.warn("No token available for WebSocket connection");
      return;
    }

    // Close existing connection if any
    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.close();
    }

    const wsUrl = `${getWebSocketUrl()}?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      set({ isConnected: true, error: null });
    };

    socket.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        get().addNotification(notification, true);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      set({ error: "WebSocket connection error" });
    };

    socket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      set({ isConnected: false, socket: null });

      // Auto-reconnect after 5 seconds if not intentionally closed
      if (event.code !== 1000) {
        setTimeout(() => {
          const currentSocket = get().socket;
          if (!currentSocket) {
            get().connectWebSocket();
          }
        }, 5000);
      }
    };

    set({ socket });
  },

  disconnectWebSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.close(1000, "User disconnected");
      set({ socket: null, isConnected: false });
    }
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

// Selector hooks
export const useNotifications = () =>
  useNotificationStore((state) => state.notifications);
export const useUnreadCount = () =>
  useNotificationStore((state) => state.unreadCount);
export const useIsConnected = () =>
  useNotificationStore((state) => state.isConnected);
