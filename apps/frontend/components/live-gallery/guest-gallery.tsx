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

const PAGE_SIZE = 20;

export function GuestGallery({ images }: Props) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isConnected, connect, socket } = useSocket();
  const photos = useGalleryStore((state) => state.photos);
  const setPhotos = useGalleryStore((state) => state.setPhotos);
  const addPhoto = useGalleryStore((state) => state.addImage);
  const isProcessing = useGalleryStore((state) => state.processing);
  const setProcessing = useGalleryStore((state) => state.setProcessing);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const nextOffset = useRef<number | null>(
    images.length >= PAGE_SIZE ? images.length : null,
  );
  const galleryFilters = useGalleryFilters();

  useSocketEvent(socket, "live-feed", async () => {
    setProcessing(false);

    const { images: newImages, nextOffset: newOffset } =
      await loadImagesWithParams({ offset: 0 });

    setPhotos(newImages);
    nextOffset.current = newOffset;
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
  }, [images, setPhotos]);

  const loadImagesWithParams = useCallback(
    async ({
      offset,
      limit = PAGE_SIZE,
    }: {
      offset: number;
      limit?: number;
    }) => {
      setIsLoadingMore(true);
      try {
        const { images: newImages = [], nextOffset: newOffset } =
          await fetchUserUploads({ ...galleryFilters, offset, limit });

        return { images: newImages, nextOffset: newOffset };
      } catch (e) {
        console.error("Error loading more images:", e);
        return { images: [], nextOffset: null };
      } finally {
        setIsLoadingMore(false);
      }
    },
    [galleryFilters],
  );

  const loadImages = useCallback(async () => {
    const offset = nextOffset.current;
    if (isLoadingMore || offset === null) return;

    const { images: newImages, nextOffset: newOffset } =
      await loadImagesWithParams({ offset, limit: PAGE_SIZE });

    nextOffset.current = newOffset;
    newImages.forEach((image) => addPhoto(image));
  }, [isLoadingMore, loadImagesWithParams, addPhoto]);

  // Trigger the infinite scroll
  useEffect(() => {
    const loaderEl = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && nextOffset.current !== null) {
          loadImages();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
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
      {nextOffset.current !== null && (
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
      {nextOffset.current === null && (
        <p className="text-center text-gray-500 py-8">
          Няма повече снимки. Винаги можеш да добавиш от своите!
        </p>
      )}
    </div>
  );
}
