"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";

export type UploadPayload = {
  message: string;
  file: File;
};

type PhotoUploadDialogProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (payload: UploadPayload) => Promise<void>;
};

export function PhotoUploadDialog({
  open,
  loading,
  onOpenChange,
  onUpload,
}: PhotoUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setSelectedFile(newFiles.at(0) ?? null);

    // Create preview URLs
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls([reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFile(null);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    await onUpload({
      file: selectedFile,
      message,
    });

    // Reset form
    setSelectedFile(null);
    setPreviewUrls([]);
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Качи своите снимки
          </DialogTitle>
          <DialogDescription>
            Сподели любимите си моменти от сватбата с всички на живо!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Uploader Name */}
          <div className="space-y-2">
            <Label htmlFor="img-message">Кратко съобщение</Label>
            <Input
              id="img-message"
              placeholder="Въведете кратко съобщение към снимката"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>Избери снимки</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Плъзни и пусни своите снимки тук, или
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Прегледай файловете
              </Button>
            </div>
          </div>

          {/* Preview Grid */}
          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Избрана снимка</Label>
              <div className="grid grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                  >
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Откажи
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="flex-1 gap-2"
            >
              <Upload className="h-4 w-4" />
              Качи снимка
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
