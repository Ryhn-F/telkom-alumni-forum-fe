import api from "@/lib/axios";

export interface StreakResponse {
  current_streak: number;
}

export async function heartbeat(): Promise<StreakResponse> {
  const response = await api.post<StreakResponse>("/api/activity/heartbeat");
  return response.data;
}
