import api from "@/lib/axios";
import { ClaimMissionResponse, Mission } from "@/types";

export async function getMissions(): Promise<Mission[]> {
  const response = await api.get<{ data: Mission[] }>("/api/missions");
  return response.data.data;
}

export async function claimMission(missionId: number): Promise<ClaimMissionResponse> {
  const response = await api.post<ClaimMissionResponse>(`/api/missions/${missionId}/claim`);
  return response.data;
}
