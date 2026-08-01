import api from "@/lib/axios";
import { FollowStatusResponse } from "@/types";

export async function toggleFollow(username: string, currentIsFollowing: boolean): Promise<{ is_following: boolean; message: string }> {
  if (currentIsFollowing) {
    const response = await api.delete<{ message: string; is_following: boolean }>(`/api/users/${username}/follow`);
    return response.data;
  } else {
    const response = await api.post<{ message: string; is_following: boolean }>(`/api/users/${username}/follow`);
    return response.data;
  }
}

export async function getFollowStatus(username: string): Promise<FollowStatusResponse> {
  const response = await api.get<FollowStatusResponse>(`/api/users/${username}/follow-status`);
  return response.data;
}

export async function trackFeedViews(threadIDs: string[]): Promise<void> {
  if (!threadIDs || threadIDs.length === 0) return;
  try {
    await api.post("/api/threads/track-views", { thread_ids: threadIDs });
  } catch {
    // Silent fail for background view tracking
  }
}
