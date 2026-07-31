import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPages = ["/login", "/register"];
const protectedRoutes = [
  "/threads/create",
  "/admin",
  "/settings",
  "/notifications",
  "/menfess",
  "/profile/edit",
];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const userData = request.cookies.get("user_data")?.value;

  const isAuthPage = authPages.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected route without token, redirect to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login/register page, redirect home/admin
  if (token && isAuthPage) {
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

  // Check admin role requirement
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (userData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userData));
        if (parsed.role?.name !== "admin") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
