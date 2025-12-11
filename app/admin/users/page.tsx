"use client";

import { useEffect, useState } from "react";
import { api, apiFormData } from "@/lib/axios";
import { getRoleDisplayName } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import type {
  UserWithProfile,
  UserListResponse,
  MessageResponse,
} from "@/types";

type UserFormData = {
  username: string;
  email: string;
  password: string;
  role: "admin" | "guru" | "siswa";
  full_name: string;
  identity_number: string;
  class_grade: string;
  bio: string;
};
const initialFormData: UserFormData = {
  username: "",
  email: "",
  password: "",
  role: "siswa",
  full_name: "",
  identity_number: "",
  class_grade: "",
  bio: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(
    null
  );

  const fetchUsers = async () => {
    try {
      const response = await api.get<UserListResponse>("/api/admin/users");
      setUsers(response.data.data || []);
    } catch {
      toast.error("Gagal memuat daftar pengguna");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      await apiFormData.post<UserWithProfile>("/api/admin/users", form);
      toast.success("Pengguna berhasil dibuat");
      setIsCreateOpen(false);
      setFormData(initialFormData);
      fetchUsers();
    } catch {
      toast.error("Gagal membuat pengguna");
    } finally {
      setSubmitting(false);
    }
  };
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value && key !== "password") form.append(key, value);
        if (key === "password" && value) form.append(key, value);
      });
      await apiFormData.put<UserWithProfile>(
        `/api/admin/users/${editingUser.user.id}`,
        form
      );
      toast.success("Pengguna berhasil diperbarui");
      setIsEditOpen(false);
      setEditingUser(null);
      setFormData(initialFormData);
      fetchUsers();
    } catch {
      toast.error("Gagal memperbarui pengguna");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setSubmitting(true);
    try {
      await api.delete<MessageResponse>(
        `/api/admin/users/${deletingUser.user.id}`
      );
      toast.success("Pengguna berhasil dihapus");
      setIsDeleteOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch {
      toast.error("Gagal menghapus pengguna");
    } finally {
      setSubmitting(false);
    }
  };
  const openEditDialog = (user: UserWithProfile) => {
    setEditingUser(user);
    setFormData({
      username: user.user.username,
      email: user.user.email,
      password: "",
      role: user.role.name as "admin" | "guru" | "siswa",
      full_name: user.profile.full_name,
      identity_number: user.profile.identity_number || "",
      class_grade: user.profile.class_grade || "",
      bio: user.profile.bio || "",
    });
    setIsEditOpen(true);
  };
  const openDeleteDialog = (user: UserWithProfile) => {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  };
  const filteredUsers = users.filter(
    (u) =>
      u.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "guru":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus pengguna sistem
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              <DialogDescription>
                Isi formulir di bawah untuk membuat pengguna baru
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        role: v as "admin" | "guru" | "siswa",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="guru">Guru</SelectItem>
                      <SelectItem value="siswa">Siswa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="identity_number">NIP/NIS</Label>
                  <Input
                    id="identity_number"
                    value={formData.identity_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identity_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_grade">Kelas</Label>
                  <Input
                    id="class_grade"
                    value={formData.class_grade}
                    onChange={(e) =>
                      setFormData({ ...formData, class_grade: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Kelas</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.user.avatar_url} />
                          <AvatarFallback>
                            {u.profile.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {u.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getRoleBadgeVariant(u.role.name) as
                            | "default"
                            | "destructive"
                            | "secondary"
                        }
                      >
                        {getRoleDisplayName(u.role.name)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {u.profile.class_grade || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(u)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada pengguna ditemukan
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>Perbarui informasi pengguna</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      role: v as "admin" | "guru" | "siswa",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="guru">Guru</SelectItem>
                    <SelectItem value="siswa">Siswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password Baru</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Kosongkan jika tidak diubah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-full_name">Nama Lengkap</Label>
              <Input
                id="edit-full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-identity_number">NIP/NIS</Label>
                <Input
                  id="edit-identity_number"
                  value={formData.identity_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identity_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-class_grade">Kelas</Label>
                <Input
                  id="edit-class_grade"
                  value={formData.class_grade}
                  onChange={(e) =>
                    setFormData({ ...formData, class_grade: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <strong>{deletingUser?.profile.full_name}</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
