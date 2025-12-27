import { api } from "./axios";
import { setToken, setUserData, setSearchToken, clearAuthCookies } from "./cookies";
import type { LoginRequest, LoginResponse, MyProfileResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

/**
 * Get the Google OAuth login URL
 * This URL will redirect the user to Google's login page
 */
export function getGoogleLoginUrl(): string {
  return `${API_URL}/api/auth/google/login`;
}

/**
 * Handle the callback from Google OAuth
 * The backend redirects to frontend with a token and search_token in the URL
 * This function fetches user data using that token
 */
export async function handleGoogleCallback(token: string, searchToken?: string): Promise<LoginResponse> {
  // Set the token in cookies for future requests
  setToken(token);
  
  // Set search token if provided
  if (searchToken) {
    setSearchToken(searchToken);
  }
  
  // Fetch user profile using the token - pass token directly in header
  // because cookie might not be set yet when this request is made
  const response = await api.get<MyProfileResponse>("/api/profile/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const userData = response.data;
  
  // Log for debugging
  console.log("Google OAuth - User data received:", userData);
  
  // Handle different response structures:
  // - role might be at top level (userData.role)
  // - OR role might be nested inside user (userData.user.role)
  const user = userData.user;
  const role = userData.role || user?.role;
  const profile = userData.profile;
  
  // Validate we got the required data
  if (!user || !role || !profile) {
    console.error("Google OAuth - Missing data:", {
      hasUser: !!user,
      hasRole: !!role,
      hasProfile: !!profile,
      userHasRole: !!user?.role,
      fullResponse: userData,
    });
    throw new Error("Data user tidak lengkap dari server");
  }
  
  // Create a LoginResponse-like object from the profile data
  const loginResponse: LoginResponse = {
    access_token: token,
    token_type: "Bearer",
    expires_in: 60 * 60 * 24 * 7, // 7 days default
    user: user,
    role: role,
    profile: profile,
    search_token: searchToken || "",
  };
  
  setUserData(
    JSON.stringify({ 
      user: loginResponse.user, 
      role: loginResponse.role, 
      profile: loginResponse.profile 
    })
  );
  
  return loginResponse;
}

export function logout(): void {
  clearAuthCookies();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function getCurrentUser(): Promise<MyProfileResponse> {
  const response = await api.get<MyProfileResponse>("/api/profile/me");
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
