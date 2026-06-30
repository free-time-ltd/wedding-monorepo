import type { ThumbnailFormat } from "./types";

/** Output directory used when `--out` is not provided. */
export const DEFAULT_OUT_DIR = "output";

/** Default max width (px) for generated thumbnails. */
export const DEFAULT_THUMB_SIZE = 400;

/** Default quality for lossy thumbnail formats. */
export const DEFAULT_QUALITY = 80;

/** Default thumbnail output format. */
export const DEFAULT_FORMAT: ThumbnailFormat = "webp";

/** Sub-directory (inside the output dir) where thumbnails are written. */
export const THUMBNAILS_SUBDIR = "thumbnails";

/** Manifest file name written to the output directory. */
export const MANIFEST_FILENAME = "manifest.json";

/** Image extensions the scanner will pick up. */
export const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tiff",
  ".tif",
  ".gif",
]);

/** Map of source extension to MIME type, recorded in the manifest. */
export const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".tiff": "image/tiff",
  ".tif": "image/tiff",
  ".gif": "image/gif",
};

/** File extension used for each thumbnail format. */
export const FORMAT_EXTENSION: Record<ThumbnailFormat, string> = {
  webp: ".webp",
  jpeg: ".jpg",
  png: ".png",
  avif: ".avif",
};

/** Thumbnail formats accepted by `--format`. */
export const VALID_FORMATS: ThumbnailFormat[] = ["webp", "jpeg", "png", "avif"];
