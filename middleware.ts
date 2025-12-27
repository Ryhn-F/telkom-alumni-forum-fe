import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/auth/google/callback"];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const userData = request.cookies.get("user_data")?.value;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublicRoute) {
    let userRole = "siswa";
    if (userData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userData));
        userRole = parsed.role?.name || "siswa";
      } catch {}
    }
    return NextResponse.redirect(
      new URL(userRole === "admin" ? "/admin" : "/", request.url)
    );
  }

  if (isAdminRoute && userData) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userData));
      if (parsed.role?.name !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
