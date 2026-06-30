import mimeToExt from "@repo/utils/mimeToExt";
import type { OfficialPhoto } from "@/lib/data";

const CDN = process.env.NEXT_PUBLIC_CDN_URL ?? "";

// Backend maps the null-album bucket to this label in /official/albums.
export const NO_ALBUM = "Без албум";

export interface OfficialPhotoUrls {
  thumb: string;
  lq: string;
  hd: string;
  download: string;
}

// The official import writes these keys (S3 layout):
//   photographer/processed/official/{thumbnail,medium,full}/{key}.webp
//   photographer/official/originals/{key}.{ext}
export function buildOfficialUrls(photo: OfficialPhoto): OfficialPhotoUrls {
  // Escape hatch for local mock data: if the key is already an absolute URL
  // (e.g. a placeholder image), use it as-is for every variant.
  if (/^https?:\/\//.test(photo.key)) {
    return {
      thumb: photo.key,
      lq: photo.key,
      hd: photo.key,
      download: photo.key,
    };
  }

  const ext = mimeToExt(photo.mimeType ?? "image/jpeg");
  return {
    thumb: `${CDN}/photographer/processed/official/thumbnail/${photo.key}.webp`,
    lq: `${CDN}/photographer/processed/official/medium/${photo.key}.webp`,
    hd: `${CDN}/photographer/processed/official/full/${photo.key}.webp`,
    download: `${CDN}/photographer/official/originals/${photo.key}.${ext}`,
  };
}

// Whether a photo belongs to a given album tab value (NO_ALBUM == null bucket).
export function photoInAlbum(photo: OfficialPhoto, album: string | null) {
  if (album === null) return true; // "all"
  if (album === NO_ALBUM) return photo.album == null;
  return photo.album === album;
}
