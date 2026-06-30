/**
 * Shared types for the photo CLI.
 *
 * The manifest entries intentionally mirror the `official_photos` table in
 * `@repo/db` so the output can be consumed directly when seeding the gallery.
 */

export type ThumbnailFormat = "webp" | "jpeg" | "png" | "avif";

/** Raw options as parsed from the command line. */
export interface CliOptions {
  /** Positional input path (a directory of images or a single image). */
  input?: string;
  /** Output directory for thumbnails and the manifest. */
  out?: string;
  /** Album name applied to every processed photo. */
  album?: string;
  /** Max width (px) for generated thumbnails. */
  size?: number;
  /** Output quality (1-100) for lossy thumbnail formats. */
  quality?: number;
  /** Thumbnail output format. */
  format?: ThumbnailFormat;
  /** Recurse into sub-directories when scanning. */
  recursive: boolean;
  /** Skip interactive prompts and accept defaults. */
  yes: boolean;
  /** Print help and exit. */
  help: boolean;
}

/** Fully resolved, validated configuration used by the pipeline. */
export interface ResolvedConfig {
  inputDir: string;
  outDir: string;
  thumbsDir: string;
  manifestPath: string;
  album: string | null;
  size: number;
  quality: number;
  format: ThumbnailFormat;
  recursive: boolean;
}

/** A single processed photo, mirroring `official_photos`. */
export interface PhotoEntry {
  id: string;
  /** Intended S3 key for the original image. */
  key: string;
  title: string;
  description: string | null;
  album: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  originalFilename: string;
  thumbnail: {
    /** Path of the thumbnail relative to the output directory. */
    key: string;
    width: number | null;
    height: number | null;
    sizeBytes: number | null;
    format: ThumbnailFormat;
  };
  createdAt: string;
}

/** The full manifest written to `manifest.json`. */
export interface Manifest {
  generatedAt: string;
  sourceDir: string;
  album: string | null;
  thumbnail: {
    format: ThumbnailFormat;
    maxWidth: number;
    quality: number;
  };
  count: number;
  photos: PhotoEntry[];
}
