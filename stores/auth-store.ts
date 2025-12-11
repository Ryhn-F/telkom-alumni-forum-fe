import { create } from "zustand";
import { getUserData } from "@/lib/cookies";
import type { User, Role, Profile } from "@/types";

interface AuthState {
  user: User | null;
  role: Role | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuthData: (user: User, role: Role, profile: Profile) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  clearError: () => void;
  hydrateFromCookie: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  role: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuthData: (user, role, profile) =>
    set({ user, role, profile, isAuthenticated: true, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearAuth: () =>
    set({
      user: null,
      role: null,
      profile: null,
      isAuthenticated: false,
      error: null,
    }),
  clearError: () => set({ error: null }),

  hydrateFromCookie: () => {
    const userData = getUserData();
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        set({
          user: parsed.user,
          role: parsed.role,
          profile: parsed.profile,
          isAuthenticated: true,
        });
      } catch {
        set({ user: null, role: null, profile: null, isAuthenticated: false });
      }
    }
  },
}));

export const useUser = () => useAuthStore((state) => state.user);
export const useRole = () => useAuthStore((state) => state.role);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () =>
  useAuthStore((state) => state.role?.name === "admin");
