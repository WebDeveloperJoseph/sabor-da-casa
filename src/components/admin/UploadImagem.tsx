"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  bucket?: string;
  prefix?: string;
};

export default function UploadImagem({
  onUploaded,
  onUploadingChange,
  bucket = "pratos",
  prefix = "uploads",
}: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas arquivos de imagem");
      input.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem excede o limite de 10MB");
      input.value = "";
      return;
    }

    try {
      setUploading(true);
      onUploadingChange?.(true);

      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      formData.append("prefix", prefix);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90_000);

      // Fazer upload via API
      let response: Response;
      try {
        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Falha no upload");
      }

      const { url } = await response.json();
      onUploaded(url);
      toast.success("Imagem enviada!");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === "AbortError"
            ? "Upload demorou demais. Tente novamente com imagem menor."
            : err.message
          : "Falha no upload";
      toast.error(message);
      console.error(err);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      // Permite selecionar o mesmo arquivo novamente e disparar onChange.
      input.value = "";
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
        onChange={handleFile}
        disabled={uploading}
      />
      {uploading && <span className="text-sm text-gray-600">Enviando...</span>}
    </div>
  );
}
