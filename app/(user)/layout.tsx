"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { logout } from "@/lib/auth";
import { useAuthStore } from "@/stores";
import { getRoleDisplayName } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { SearchTrigger } from "@/components/SearchDialog";


const navigation = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Diskusi", href: "/threads", icon: MessageSquare },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, role, profile } = useAuthStore();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-semibold text-lg">
               <span className="text-primary">Telkom</span>Forum 
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("gap-2", isActive && "bg-secondary")}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              {/* Menfess - Only for siswa and admin */}
              {role?.name !== "guru" && (
                <Link href="/menfess">
                  <Button
                    variant={pathname === "/menfess" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2", pathname === "/menfess" && "bg-secondary")}
                  >
                    <EyeOff className="h-4 w-4" />
                    Menfess
                  </Button>
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <SearchTrigger />
              <Link href="/threads/new" className="hidden sm:block">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Buat Diskusi
                </Button>
              </Link>
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              {/* Profile Dropdown - Desktop Only */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback>
                          {(profile?.full_name ||
                            user?.username ||
                            "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <p className="text-sm font-medium">
                        {profile?.full_name || user?.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                            <Settings className="mr-2 h-4 w-4" />
                            Dashboard Admin
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-col h-auto py-2 px-3",
                    isActive && "text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </Link>
            );
          })}
          {/* Menfess - Only for siswa and admin */}
          {role?.name !== "guru" && (
            <Link href="/menfess">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col h-auto py-2 px-3",
                  pathname === "/menfess" && "text-primary"
                )}
              >
                <EyeOff className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {/* Create Thread - Mobile */}
          <Link href="/threads/new">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-col h-auto py-2 px-3",
                pathname === "/threads/new" && "text-primary"
              )}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
          {/* Profile Dropdown - Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col h-auto py-2 px-3",
                  pathname.startsWith("/profile") && "text-primary"
                )}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="text-[10px]">
                    {(profile?.full_name || user?.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="center" side="top">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">
                  {profile?.full_name || user?.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground">
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
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>


      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-5xl">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
