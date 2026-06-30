import { randomUUID } from "node:crypto";
import { copyFile, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import mimeToExt from "@repo/utils/mimeToExt";

import { FULL_SIZE, MEDIUM_SIZE, MIME_BY_EXTENSION } from "../config";
import type { PhotoEntry, ResolvedConfig } from "../types";

/** Turn a file name into a human-friendly title ("my-photo_01" -> "My Photo 01"). */
function titleFromFilename(filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function mimeFor(filename: string): string | null {
  return MIME_BY_EXTENSION[path.extname(filename).toLowerCase()] ?? null;
}

/**
 * Derive a bare, extensionless, path-safe key from a filename. The frontend
 * appends the extension/size itself, so the key must contain neither.
 */
export function keyFromFilename(filename: string): string {
  const stem = path.basename(filename, path.extname(filename));
  const safe = stem
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe || "photo";
}

/**
 * Process a single source image into the gallery layout:
 *   - three webp renditions under `{processedDir}/{thumbnail,medium,full}/{key}.webp`
 *   - a copy of the original under `{originalsDir}/{key}.{ext}` (for download)
 * Returns the manifest entry describing the result.
 */
export async function processImage(
  sourcePath: string,
  config: ResolvedConfig,
  key: string,
): Promise<PhotoEntry> {
  const filename = path.basename(sourcePath);
  const { size: sourceBytes } = await stat(sourcePath);

  const image = sharp(sourcePath, { failOn: "error" });
  const metadata = await image.metadata();

  const mimeType = mimeFor(filename);
  const ext = mimeType
    ? mimeToExt(mimeType)
    : path.extname(filename).slice(1).toLowerCase();

  // Generate the three webp renditions the frontend expects.
  const widths: Record<string, number> = {
    thumbnail: config.size,
    medium: MEDIUM_SIZE,
    full: FULL_SIZE,
  };
  for (const [segment, width] of Object.entries(widths)) {
    await image
      .clone()
      .rotate() // honour EXIF orientation
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: config.quality })
      .toFile(path.join(config.processedDir, segment, `${key}.webp`));
  }

  // Copy the untouched original for the download link, renamed to the key.
  await copyFile(sourcePath, path.join(config.originalsDir, `${key}.${ext}`));

  // Account for EXIF orientation so stored dimensions match the rendered image.
  const swapDims = (metadata.orientation ?? 1) >= 5;
  const width = swapDims ? metadata.height : metadata.width;
  const height = swapDims ? metadata.width : metadata.height;

  return {
    id: randomUUID(),
    key,
    title: titleFromFilename(filename),
    description: null,
    album: config.album,
    width: width ?? null,
    height: height ?? null,
    sizeBytes: sourceBytes,
    mimeType,
    originalFilename: filename,
    createdAt: new Date().toISOString(),
  };
}
