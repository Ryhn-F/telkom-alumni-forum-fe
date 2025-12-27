"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFormData } from "@/lib/axios";
import { useAuthStore } from "@/stores";
import { setUserData } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, Save } from "lucide-react";
import type { UserWithProfile } from "@/types";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, profile, role, setAuthData } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || "");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (username && username !== user?.username)
        formData.append("username", username);
      if (password) formData.append("password", password);
      if (bio !== profile?.bio) formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);
      const response = await apiFormData.put<UserWithProfile>(
        "/api/profile",
        formData
      );
      if (response.data.user && response.data.profile && role) {
        setAuthData(response.data.user, role, response.data.profile);
        setUserData(
          JSON.stringify({
            user: response.data.user,
            role,
            profile: response.data.profile,
          })
        );
      }
      toast.success("Profil berhasil diperbarui");
      router.push("/profile");
    } catch {
      toast.error("Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
          <CardDescription>Perbarui informasi profil Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-xl">
                  {(profile?.full_name || username || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Upload className="h-4 w-4" />
                    Ganti Foto Profil
                  </div>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, atau GIF. Maksimal 2MB.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Spasi akan otomatis diganti dengan underscore (_)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah
              </p>
            </div>
            {/* Only show password field if user is NOT using Google OAuth */}
            {!user?.email?.endsWith("@student.smktelkom-jkt.sch.id") && (
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
                <p className="text-xs text-muted-foreground">
                  Minimal 8 karakter
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                rows={4}
                placeholder="Ceritakan sedikit tentang diri Anda..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
