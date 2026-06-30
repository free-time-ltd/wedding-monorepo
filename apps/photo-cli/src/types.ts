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
  /** Output quality (1-100) for the webp renditions. */
  quality?: number;
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
  /** `{out}/official/originals` — downloadable originals, renamed to `{key}.{ext}`. */
  originalsDir: string;
  /** `{out}/processed/official` — holds the `thumbnail`/`medium`/`full` rendition dirs. */
  processedDir: string;
  manifestPath: string;
  album: string | null;
  /** Width (px) of the smallest (thumbnail) rendition. */
  size: number;
  quality: number;
  recursive: boolean;
}

/**
 * A single processed photo, mirroring the columns of the `official_photos`
 * table so the manifest can be imported directly. `key` is a bare,
 * extensionless, path-safe identifier; the frontend builds every URL from it
 * (`processed/official/<size>/<key>.webp`, `official/originals/<key>.<ext>`).
 */
export interface PhotoEntry {
  id: string;
  key: string;
  title: string;
  description: string | null;
  album: string | null;
  /** Oriented dimensions of the original image. */
  width: number | null;
  height: number | null;
  /** Byte size of the original file. */
  sizeBytes: number | null;
  mimeType: string | null;
  originalFilename: string;
  createdAt: string;
}

/** The full manifest written to `manifest.json`. */
export interface Manifest {
  generatedAt: string;
  sourceDir: string;
  album: string | null;
  renditions: {
    format: "webp";
    quality: number;
    /** Max width (px) per rendition segment. */
    thumbnail: number;
    medium: number;
    full: number;
  };
  count: number;
  photos: PhotoEntry[];
}
