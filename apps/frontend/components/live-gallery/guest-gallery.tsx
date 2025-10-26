"use client";

import { ProcessedImageApiType } from "@/lib/data";
import ImageCard from "./image-card";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";

interface Props {
  images: ProcessedImageApiType[];
}
export function GuestGallery({ images }: Props) {
  const { isConnected, connect, socket } = useSocket();
  useSocketEvent(socket, "live-feed", () => {
    // @todo Refetch the images
  });

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="gallery-container">
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <ImageCard image={img} key={img.id} />
          ))}
        </div>
      )}
    </div>
  );
}
