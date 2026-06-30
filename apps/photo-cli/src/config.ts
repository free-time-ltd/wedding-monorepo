import type { ThumbnailFormat } from "./types";

/** Output directory used when `--out` is not provided. */
export const DEFAULT_OUT_DIR = "output";

/** Default max width (px) for the smallest (thumbnail) rendition. */
export const DEFAULT_THUMB_SIZE = 400;

/** Default quality for the webp renditions. */
export const DEFAULT_QUALITY = 80;

/** Default thumbnail output format. */
export const DEFAULT_FORMAT: ThumbnailFormat = "webp";

/**
 * Processed rendition widths (px). These map to the S3/CDN size segments the
 * frontend expects under `photographer/processed/<segment>/<key>.webp`. The
 * `thumbnail` width is overridable via `--size`; medium/full are fixed.
 */
export const MEDIUM_SIZE = 1280;
export const FULL_SIZE = 2048;

/**
 * Output sub-paths mirroring the S3/CloudFront bucket layout, so the whole
 * `photographer/` tree can be shipped with a single
 * `aws s3 sync output/photographer/ s3://bucket/photographer/`.
 */
export const PROCESSED_SUBDIR = "photographer/processed"; // + /{thumbnail,medium,full}/{key}.webp
export const ORIGINALS_SUBDIR = "photographer/official"; // + /{key}.{ext}

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
