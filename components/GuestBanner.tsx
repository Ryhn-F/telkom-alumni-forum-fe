"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/cookies";
import { Sparkles, LogIn, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuestBanner() {
  const [isGuest, setIsGuest] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user is unauthenticated guest
    if (!getToken()) {
      setIsGuest(true);
    }
  }, []);

  if (!isGuest || dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white shadow-xl shadow-red-500/10 mb-6">
      {/* Background Accent Graphics */}
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Komunitas Alumni SMK Telkom Jakarta</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Selamat Datang di Forum Komunitas!
          </h2>
          <p className="text-sm text-red-50/90 leading-relaxed">
            Anda sedang menjelajahi forum sebagai pengunjung. Masuk atau daftar akun untuk ikut memberikan tanggapan, menyukai postingan, dan berdiskusi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
          <Link href="/login" className="flex-1 md:flex-initial">
            <Button
              variant="secondary"
              className="w-full bg-white text-red-700 hover:bg-red-50 font-semibold shadow-md gap-2"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </Button>
          </Link>
          <Link href="/register" className="flex-1 md:flex-initial">
            <Button
              variant="outline"
              className="w-full border-white/40 bg-white/10 text-white hover:bg-white/20 font-semibold gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Daftar Akun
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full ml-auto md:ml-0"
            title="Tutup banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
