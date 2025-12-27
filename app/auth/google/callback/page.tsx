"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores";
import { handleGoogleCallback } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Suspense } from "react";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const { setAuthData } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    const searchToken = searchParams.get("search_token");
    
    if (!token) {
      setStatus("error");
      setErrorMessage("Token tidak ditemukan. Silakan coba login kembali.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
      return;
    }

    // Process the token
    const processToken = async () => {
      try {
        const response = await handleGoogleCallback(token, searchToken || undefined);
        
        // Safely check if we have the required data
        if (!response.user || !response.role || !response.profile) {
          throw new Error("Data user tidak lengkap dari server");
        }
        
        setAuthData(response.user, response.role, response.profile);
        setStatus("success");
        
        // Redirect based on role - use window.location for hard navigation
        const redirectUrl = response.role?.name === "admin" ? "/admin" : "/";
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : "Terjadi kesalahan saat memproses login. Silakan coba lagi."
        );
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    };

    processToken();
  }, [searchParams, setAuthData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-300">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Memproses Login..."}
            {status === "success" && "Login Berhasil!"}
            {status === "error" && "Login Gagal"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Mohon tunggu, kami sedang memverifikasi akun Google Anda."}
            {status === "success" && "Anda akan dialihkan ke halaman utama."}
            {status === "error" && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          )}
          {status === "error" && (
            <p className="text-sm text-muted-foreground text-center">
              Anda akan dialihkan ke halaman login dalam beberapa detik...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Memproses...</CardTitle>
          <CardDescription>
            Mohon tunggu sebentar.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackLoading />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
