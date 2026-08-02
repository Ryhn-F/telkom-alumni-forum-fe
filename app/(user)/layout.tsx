"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { logout } from "@/lib/auth";
import { useAuthStore } from "@/stores";
import { getRoleDisplayName } from "@/lib/auth";
import { getToken } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CosmeticAvatar } from "@/components/cosmetic/CosmeticAvatar";
import { getUserCosmetics } from "@/lib/cosmetic";
import type { UserEquip } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  MessageSquare,
  User,
  LogOut,
  Sun,
  Moon,
  Plus,
  Settings,
  StickyNote,
  Trophy,
  Sparkles,
  Shield,
  ChevronRight,
  ListChecks,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { SearchTrigger } from "@/components/SearchDialog";
import { WalletChip } from "@/components/cosmetic/WalletChip";
import { heartbeat } from "@/lib/activity";

const sidebarNav = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Diskusi", href: "/threads", icon: MessageSquare },
  { name: "Papan Menfess", href: "/menfess", icon: StickyNote, badge: "ANONIM", requiresStudent: true },
  { name: "Papan Klasemen", href: "/leaderboard", icon: Trophy },
  { name: "Misi Harian", href: "/missions", icon: ListChecks, requiresAuth: true },
  { name: "Toko", href: "/shop", icon: Store, requiresAuth: true },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, role, profile } = useAuthStore();
  const [equip, setEquip] = useState<UserEquip | null>(null);

  useEffect(() => {
    if (!user?.username) return;
    getUserCosmetics(user.username).then(setEquip).catch(() => setEquip(null));
  }, [user?.username]);

  // One heartbeat per browser session (not per navigation — the layout
  // persists across route changes, and the call is idempotent per WIB day
  // anyway) — feeds the login_streak daily mission + streak achievements.
  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem("streak_heartbeat_sent") === "1") return;
    sessionStorage.setItem("streak_heartbeat_sent", "1");
    heartbeat().catch(() => sessionStorage.removeItem("streak_heartbeat_sent"));
  }, [user]);

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
                <span className="text-red-600 dark:text-red-500">Telkom</span>Forum
              </span>
            </Link>

            {/* Glowing Wide Search Bar */}
            <div className="flex-1 max-w-xl flex items-center justify-center">
              <SearchTrigger />
            </div>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {user && <WalletChip />}
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title="Ganti Tema"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-300" />
              </Button>

              {/* User Avatar / Login Button */}
              {user ? (
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full p-0 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                      >
                        <CosmeticAvatar
                          avatarUrl={user?.avatar_url}
                          username={profile?.full_name || user?.username || "U"}
                          size={36}
                          border={equip?.avatar_border}
                          fallbackClassName="bg-red-50 text-red-600"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || user?.username}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {user?.email}
                        </p>
                        <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                          {role && getRoleDisplayName(role.name)}
                        </p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profil Saya
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/edit">
                          <Settings className="mr-2 h-4 w-4" />
                          Pengaturan
                        </Link>
                      </DropdownMenuItem>
                      {role?.name === "admin" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin">
                              <Shield className="mr-2 h-4 w-4 text-red-600" />
                              Dashboard Admin
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="text-destructive font-medium"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-semibold">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="font-semibold shadow-sm">
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout with Left Sidebar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 pt-6">
          {/* Desktop Left Sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-22 space-y-6">
              {/* Navigation Menu */}
              <div className="space-y-1 bg-card/60 backdrop-blur border border-border/40 p-2.5 rounded-2xl shadow-xs">

                {sidebarNav.map((item) => {
                  if (item.requiresStudent && role?.name === "guru") return null;
                  if (item.requiresAuth && !user) return null;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer",
                          isActive
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 font-semibold border-r-2 border-red-600 shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={cn(
                              "h-4 w-4 transition-transform group-hover:scale-110",
                              isActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                            )}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Create Thread Action Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-100">
                    Komunitas Telkom
                  </span>
                </div>
                <p className="text-xs text-red-50/90 leading-relaxed font-normal">
                  Punya pertanyaan atau topik seru yang ingin didiskusikan?
                </p>
                <Link
                  href="/threads/new"
                  className="block"
                >
                  <Button
                    variant="secondary"
                    className="w-full bg-white text-red-700 hover:bg-red-50 font-bold shadow-sm gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Diskusi Baru
                  </Button>
                </Link>
              </div>

              {/* Profile Card Footer if Logged In */}
              {user && (
                <div className="p-3.5 rounded-2xl border border-border/50 bg-card/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CosmeticAvatar
                      avatarUrl={user.avatar_url}
                      username={profile?.full_name || user.username || "U"}
                      size={36}
                      border={equip?.avatar_border}
                      className="shrink-0 border border-primary/20"
                      fallbackClassName="bg-red-50 text-red-600"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {profile?.full_name || user.username}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Main Page Content */}
          <main className="min-w-0 pb-24 md:pb-8">
            <div className="animate-fade-in">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/60">
        <div className="flex items-center justify-around py-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex-col h-auto py-1.5 px-3", pathname === "/" && "text-red-600 font-semibold")}
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Beranda</span>
            </Button>
          </Link>

          <Link href="/threads">
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex-col h-auto py-1.5 px-3", pathname.startsWith("/threads") && pathname !== "/threads/new" && "text-red-600 font-semibold")}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Diskusi</span>
            </Button>
          </Link>

          {role?.name !== "guru" && (
            <Link href="/menfess">
              <Button
                variant="ghost"
                size="sm"
                className={cn("flex-col h-auto py-1.5 px-3", pathname === "/menfess" && "text-red-600 font-semibold")}
              >
                <StickyNote className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Menfess</span>
              </Button>
            </Link>
          )}

          <Link href="/threads/new">
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex-col h-auto py-1.5 px-3", pathname === "/threads/new" && "text-red-600 font-semibold")}
            >
              <Plus className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Buat</span>
            </Button>
          </Link>

          <Link href={user ? "/profile" : "/login"}>
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex-col h-auto py-1.5 px-3", pathname.startsWith("/profile") && "text-red-600 font-semibold")}
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Profil</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
