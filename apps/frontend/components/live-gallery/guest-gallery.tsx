"use client";

import { ProcessedImageApiType } from "@/lib/data";
import ImageCard, { ImageCardSkeleton } from "./image-card";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";
import { useGalleryStore } from "@/store/galleryStore";

interface Props {
  images: ProcessedImageApiType[];
}

export function GuestGallery({ images }: Props) {
  const { isConnected, connect, socket } = useSocket();
  const photos = useGalleryStore((state) => state.photos);
  const setPhotos = useGalleryStore((state) => state.setPhotos);
  const isProcessing = useGalleryStore((state) => state.processing);
  const setProcessing = useGalleryStore((state) => state.setProcessing);

  useSocketEvent(socket, "live-feed", () => {
    setProcessing(false);
    // @todo Refetch the images and update the global state
    // Also respect the pagination
  });

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate the store
  useEffect(() => {
    if (photos.length === 0 && images.length > 0) {
      setPhotos(images);
    }
  }, [images, photos.length, setPhotos]);

  return (
    <div className="gallery-container container">
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isProcessing && <ImageCardSkeleton />}
          {photos.map((img) => (
            <ImageCard image={img} key={img.id} />
          ))}
        </div>
      )}
    </div>
  );
}
