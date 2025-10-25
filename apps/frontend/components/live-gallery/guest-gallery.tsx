"use client";

import type { UserApiType } from "@repo/db/utils";
import { UploadForm } from "./upload-form";
import { ProcessedImageApiType } from "@/lib/data";

interface Props {
  user: UserApiType;
  images: ProcessedImageApiType[];
}
export function GuestGallery({ user, images }: Props) {
  return (
    <div className="gallery-container">
      <p>Uploading image as: {user.name}</p>
      <p>Uploaded images: {images.length}</p>
      <div className="form-container">
        <UploadForm />
      </div>
    </div>
  );
}
