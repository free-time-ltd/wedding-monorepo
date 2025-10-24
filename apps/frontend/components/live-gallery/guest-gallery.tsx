"use client";

import { UploadForm } from "./upload-form";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: any[];
}
export function GuestGallery({ images }: Props) {
  return (
    <div className="gallery-container">
      <p>Uploaded images: {images.length}</p>
      <div className="form-container">
        <UploadForm />
      </div>
    </div>
  );
}
