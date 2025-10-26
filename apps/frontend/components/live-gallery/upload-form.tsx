"use client";
import { toast } from "@repo/ui";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { FormEvent, useState } from "react";

export function UploadForm() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return false;

    setLoading(true);

    try {
      const filename = file.name;
      const mimeType = file.type;
      const sizeBytes = file.size;

      if (!mimeType.startsWith("image/")) {
        toast.error("Трябва да качите картинка!");
        return false;
      }

      const { width, height } = await getImageDimensions(file);

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
        return false;
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
        return false;
      }

      toast.success(
        "Казването на картинката беше успешно. До няколко минути ще бъде обработена и ще бъде видима в сайта!"
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getImageDimensions = async (file: File) => {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="image">Image</Label>
        <Input
          type="file"
          id="image"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
