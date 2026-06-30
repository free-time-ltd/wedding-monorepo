// LOCAL PREVIEW MOCK DATA — for eyeballing the /gallery page before real
// photos are uploaded. Toggle `USE_MOCK` in app/(root)/gallery/page.tsx (or
// delete that import) before shipping to prod. Images come from picsum.photos
// so they render locally without any S3/processing.
import type { Album, OfficialPhoto } from "./data";

function mk(
  i: number,
  album: string | null,
  w: number,
  h: number,
): OfficialPhoto {
  return {
    id: `mock-${i}`,
    // Absolute URL — buildOfficialUrls() passes these through as-is.
    key: `https://picsum.photos/seed/wed-${i}/${w}/${h}`,
    url: null,
    title: `IMG_${String(i).padStart(4, "0")}.jpg`,
    description: null,
    createdAt: null,
    width: w,
    height: h,
    sizeBytes: w * h * 3,
    mimeType: "image/jpeg",
    album,
  };
}

// A mix of landscape / portrait / square so the square grid crop and the
// object-contain lightbox both get exercised.
const DIMS: [number, number][] = [
  [1600, 1067],
  [1067, 1600],
  [1600, 1067],
  [1500, 1500],
  [1600, 900],
  [1080, 1350],
];

function album(name: string | null, start: number, count: number) {
  return Array.from({ length: count }, (_, k) => {
    const [w, h] = DIMS[(start + k) % DIMS.length]!;
    return mk(start + k, name, w, h);
  });
}

export const mockOfficialPhotos: OfficialPhoto[] = [
  ...album("Подготовка", 1, 5),
  ...album("Церемония", 6, 8),
  ...album("Тържество", 14, 9),
  ...album(null, 23, 2), // exercises the "Без албум" bucket
];

export const mockAlbums: Album[] = [
  { album: "Подготовка", imageCount: 5 },
  { album: "Церемония", imageCount: 8 },
  { album: "Тържество", imageCount: 9 },
  { album: "Без албум", imageCount: 2 },
];
