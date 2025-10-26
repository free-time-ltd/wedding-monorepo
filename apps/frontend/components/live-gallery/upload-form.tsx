"use client";
import { toast } from "@repo/ui";
import { Button } from "@repo/ui/components/ui/button";
import { Upload } from "@repo/ui/icons";
import { useState } from "react";
import { PhotoUploadDialog, UploadPayload } from "./photo-upload-dialog";

export function UploadForm() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getImageDimensions = async (file: File) => {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  };

  const handleUpload = async ({ file, message }: UploadPayload) => {
    try {
      setLoading(true);

      const { width, height } = await getImageDimensions(file);
      const filename = file.name;
      const mimeType = file.type;
      const sizeBytes = file.size;

      if (!mimeType.startsWith("image/")) {
        toast.error("Трябва да качите картинка!");
        return;
      }

      const payload = {
        filename,
        mimeType,
        sizeBytes,
        width,
        height,
        message,
      };

      // Generate presigned upload URL
      const url = new URL(
        "/api/images/upload",
        process.env.NEXT_PUBLIC_API_BASE_URL
      );

      const res = await fetch(url, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Нещо не е наред с генерацията на адрес. Опитайте отново.");
        return;
      }

      const json = await res.json();

      const uploadUrl = json.data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": mimeType,
        },
      });

      if (!uploadRes.ok) {
        toast.error(`Качването имаше проблем със статус: ${uploadRes.status}`);
        return;
      }

      toast.success(
        "Казването на картинката беше успешно. До няколко минути ще бъде обработена и ще бъде видима в сайта!"
      );
    } catch (e) {
      console.error(e);
      toast.error("Имаше проблем с качването на снимка. Моля опитайте отново!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        onClick={() => setUploadOpen(true)}
        className="gap-2 mt-2"
      >
        <Upload className="h-4 w-4" />
        Качи снимка
      </Button>
      <PhotoUploadDialog
        onOpenChange={setUploadOpen}
        open={uploadOpen}
        loading={loading}
        onUpload={handleUpload}
      />
    </>
  );
}
