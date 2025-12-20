// Cookie utility functions for token management
const TOKEN_KEY = "access_token";
const USER_KEY = "user_data";
const SEARCH_TOKEN_KEY = "search_token";

const isClient = typeof window !== "undefined";

export function setToken(token: string, expiresIn?: number): void {
  if (!isClient) return;
  const maxAge = expiresIn || 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getToken(): string | null {
  if (!isClient) return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === TOKEN_KEY) return value;
  }
  return null;
}

export function removeToken(): void {
  if (!isClient) return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function setUserData(userData: string): void {
  if (!isClient) return;
  const encoded = encodeURIComponent(userData);
  document.cookie = `${USER_KEY}=${encoded}; path=/; max-age=${
    60 * 60 * 24 * 7
  }; SameSite=Lax`;
}

export function getUserData(): string | null {
  if (!isClient) return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === USER_KEY) return decodeURIComponent(value);
  }
  return null;
}

export function removeUserData(): void {
  if (!isClient) return;
  document.cookie = `${USER_KEY}=; path=/; max-age=0`;
}

export function setSearchToken(token: string, expiresIn?: number): void {
  if (!isClient) return;
  const maxAge = expiresIn || 60 * 60 * 24 * 7;
  document.cookie = `${SEARCH_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getSearchToken(): string | null {
  if (!isClient) return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === SEARCH_TOKEN_KEY) return value;
  }
  return null;
}

export function removeSearchToken(): void {
  if (!isClient) return;
  document.cookie = `${SEARCH_TOKEN_KEY}=; path=/; max-age=0`;
}

export function clearAuthCookies(): void {
  removeToken();
  removeUserData();
  removeSearchToken();
}

export function hasToken(): boolean {
  return getToken() !== null;
}

