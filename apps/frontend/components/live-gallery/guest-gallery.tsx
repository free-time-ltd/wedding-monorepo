"use client";

import { fetchUserUploads, ProcessedImageApiType } from "@/lib/data";
import ImageCard, { ImageCardSkeleton } from "./image-card";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useSocket } from "@/context/SocketContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGalleryStore } from "@/store/galleryStore";
import { Loader } from "../loader";
import { useGalleryFilters } from "@/hooks/useGalleryFilters";

interface Props {
  images: ProcessedImageApiType[];
}

export function GuestGallery({ images }: Props) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isConnected, connect, socket } = useSocket();
  const photos = useGalleryStore((state) => state.photos);
  const setPhotos = useGalleryStore((state) => state.setPhotos);
  const addPhoto = useGalleryStore((state) => state.addImage);
  const isProcessing = useGalleryStore((state) => state.processing);
  const setProcessing = useGalleryStore((state) => state.setProcessing);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const nextCursor = useRef(images.at(-1)?.id ?? null);
  const galleryFilters = useGalleryFilters();

  useSocketEvent(socket, "live-feed", async () => {
    setProcessing(false);

    const { images: newImages, nextCursor: newCursor } =
      await loadImagesWithParams({ cursor: null });

    setPhotos(newImages);
    nextCursor.current = newCursor;
  });

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate the store
  useEffect(() => {
    setPhotos(images);
    if (nextCursor.current) {
      nextCursor.current = null;
    }
  }, [images, setPhotos]);

  const loadImagesWithParams = useCallback(
    async ({
      cursor,
      limit = 20,
    }: {
      cursor: string | null;
      limit?: number;
    }) => {
      setIsLoadingMore(true);
      try {
        const { images: newImages = [], nextCursor: newCursor } =
          await fetchUserUploads({ ...galleryFilters, cursor, limit });

        return { images: newImages, nextCursor: newCursor };
      } catch (e) {
        console.error("Error loading more images:", e);
        return { images: [], nextCursor: null };
      } finally {
        setIsLoadingMore(false);
      }
    },
    [galleryFilters]
  );

  const loadImages = useCallback(async () => {
    const cursor = nextCursor.current;
    if (isLoadingMore || !cursor) return;

    const { images: newImages, nextCursor: newCursor } =
      await loadImagesWithParams({ cursor, limit: 20 });

    nextCursor.current = newCursor;
    newImages.forEach((image) => addPhoto(image));
  }, [isLoadingMore, loadImagesWithParams, addPhoto]);

  // Trigger the infinite scroll
  useEffect(() => {
    const loaderEl = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && !!nextCursor.current) {
          loadImages();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loaderEl) {
      observer.observe(loaderEl);
    }

    return () => {
      if (loaderEl) {
        observer.unobserve(loaderEl);
      }
    };
  }, [loadImages]);

  return (
    <div className="gallery-container container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isProcessing && <ImageCardSkeleton />}
        {photos.map((img) => (
          <ImageCard image={img} key={img.id} />
        ))}
      </div>
      {!!nextCursor.current && (
        <div ref={loaderRef} className="w-full py-8 flex justify-center">
          {isLoadingMore && (
            <>
              <Loader />
              <p className="text-center text-gray-500 py-8">
                Зареждане на снимки...
              </p>
            </>
          )}
        </div>
      )}
      {!nextCursor.current && (
        <p className="text-center text-gray-500 py-8">
          Няма повече снимки. Винаги можеш да добавиш от своите!
        </p>
      )}
    </div>
  );
}
