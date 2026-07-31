"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, getGoogleLoginUrl } from "@/lib/auth";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthData, setLoading, setError, isLoading, error } =
    useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  // Check for error in URL (from Google OAuth redirect)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setUrlError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUrlError(null);
    try {
      const response = await login({ email, password });
      setAuthData(response.user, response.role, response.profile);
      const redirect = searchParams.get("redirect");
      router.push(
        redirect || (response.role.name === "admin" ? "/admin" : "/")
      );
    } catch {
      setError("Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setUrlError(null);
    window.location.href = getGoogleLoginUrl();
  };

  const displayError = urlError || error;

  return (
    <div className="h-screen w-full bg-[#dc2626] flex flex-col justify-between overflow-hidden select-none relative">
      {/* Main Container Grid */}
      <div className="flex-1 w-full pl-4 md:pl-8 lg:pl-16 pr-0 grid grid-cols-1 lg:grid-cols-12 items-end pt-6 md:pt-10">
        
        {/* Left Side: Standalone Card centered vertically */}
        <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-start self-center pb-8 md:pb-12 z-10 pr-4">
          <Card className="w-full max-w-md shadow-2xl bg-white text-slate-900 border-0 rounded-none p-2 sm:p-4">
            <CardHeader className="text-center pb-2">
              <Link href="/" className="inline-flex items-center justify-center">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                  <span className="text-red-600">Telkom</span>Forum
                </span>
              </Link>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Google OAuth Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-slate-200 hover:border-red-500 hover:bg-red-50/50 text-slate-700 font-semibold rounded-none transition-all duration-200 shadow-xs gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Masuk dengan Google</span>
              </Button>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-white px-3 text-slate-400 font-bold">
                    Atau dengan Email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-10 rounded-none border-slate-200 focus:border-red-600 focus:ring-red-600 text-slate-900 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-10 rounded-none border-slate-200 focus:border-red-600 focus:ring-red-600 text-slate-900 bg-slate-50/50"
                  />
                </div>

                {displayError && (
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-none border border-red-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                    <span>{displayError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none shadow-md transition-all gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer Link */}
              <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                Belum punya akun?{" "}
                <Link href="/register" className="font-bold text-red-600 hover:underline">
                  Daftar Sekarang
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Artwork aligned flush to the bottom and right viewport edges */}
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 justify-end items-end self-end pr-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/login-art.png"
            alt="Telkom Alumni Artwork"
            className="max-h-[92vh] w-auto object-contain object-right-bottom block mr-0 select-none pointer-events-none"
          />
        </div>

      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#dc2626] p-4">
      <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-4">
        <Skeleton className="mx-auto w-12 h-12 rounded-xl" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
