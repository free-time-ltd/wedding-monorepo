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
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  photos: [],
  processing: false,
  addImage: (image) =>
    set((state) => ({
      photos: [image, ...state.photos],
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
}));
