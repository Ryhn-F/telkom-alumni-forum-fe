"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { ImageIcon, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface AttachmentUploadProps {
  onUploadSuccess: (id: number, url: string) => void;
  disabled?: boolean;
}

export function AttachmentUpload({
  onUploadSuccess,
  disabled,
}: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so validation can be re-triggered or same file can be selected
    e.target.value = "";

    // Simple validation
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Format file tidak didukung. Gunakan gambar atau PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post<{ id: number; file_url: string; file_type: string }>("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Response { id: 105, file_url: "...", file_type: "..." }
      const { id, file_url } = res.data;
      onUploadSuccess(id, file_url);
      toast.success("File berhasil diupload");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengupload file");
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="inline-block">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || uploading}
        className="gap-2"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
        Sisipkan Gambar/File
      </Button>
    </div>
  );
}
