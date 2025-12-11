"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores";

export function Providers({ children }: { children: React.ReactNode }) {
  const { hydrateFromCookie } = useAuthStore();

  useEffect(() => {
    hydrateFromCookie();
  }, [hydrateFromCookie]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
