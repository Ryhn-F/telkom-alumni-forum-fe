import { api } from "./axios";
import { setToken, setUserData, setSearchToken, clearAuthCookies } from "./cookies";
import type { LoginRequest, LoginResponse, UserWithProfile } from "@/types";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/api/auth/login",
    credentials
  );
  const data = response.data;
  setToken(data.access_token, data.expires_in);
  setUserData(
    JSON.stringify({ user: data.user, role: data.role, profile: data.profile })
  );
  if (data.search_token) {
    setSearchToken(data.search_token, data.expires_in);
  }
  return data;
}

export function logout(): void {
  clearAuthCookies();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function getCurrentUser(): Promise<UserWithProfile> {
  const response = await api.get<UserWithProfile>("/api/profile/me");
  return response.data;
}

export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: "Admin",
    guru: "Guru",
    siswa: "Siswa",
  };
  return roleNames[role] || role;
}
