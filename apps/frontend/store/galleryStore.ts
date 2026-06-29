import { ProcessedImageApiType } from "@/lib/data";
import { create } from "zustand";

export interface GalleryStore {
  photos: ProcessedImageApiType[];
  processing: boolean;
  addImage: (image: ProcessedImageApiType) => void;
  removeImage: (imgId: string) => void;
  clearImages: () => void;
  setPhotos: (photos: ProcessedImageApiType[]) => void;
  setProcessing: (newVal: boolean) => void;
  toggleProcessing: () => void;
  setLike: (imageId: string, liked: boolean, likesCount: number) => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  photos: [],
  processing: false,
  addImage: (image) =>
    set((state) => ({
      photos: state.photos.some((photo) => photo.id === image.id)
        ? state.photos
        : [...state.photos, image],
    })),
  removeImage: (imgId) =>
    set((state) => ({
      photos: state.photos.filter((img) => img.id !== imgId),
    })),
  clearImages: () =>
    set(() => ({
      photos: [],
    })),
  setPhotos: (photos) => set({ photos }),
  setProcessing: (newVal) =>
    set(() => ({
      processing: newVal,
    })),
  toggleProcessing: () =>
    set((state) => ({
      processing: !state.processing,
    })),
  setLike: (imageId, liked, likesCount) =>
    set((state) => ({
      photos: state.photos.map((photo) =>
        photo.id === imageId
          ? { ...photo, likedByMe: liked, likesCount }
          : photo,
      ),
    })),
}));
