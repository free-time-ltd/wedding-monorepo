"use client";

import { ProcessedImageApiType } from "@/lib/data";
import ImageCard from "./image-card";

interface Props {
  images: ProcessedImageApiType[];
}
export function GuestGallery({ images }: Props) {
  return (
    <div className="gallery-container">
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {images.map((img) => (
            <ImageCard image={img} key={img.id} />
          ))}
        </div>
      )}
    </div>
  );
}
