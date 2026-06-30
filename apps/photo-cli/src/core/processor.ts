import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { FORMAT_EXTENSION, MIME_BY_EXTENSION } from "../config";
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
 * Process a single source image: read its metadata and write a thumbnail into
 * `config.thumbsDir`. Returns the manifest entry describing the result.
 */
export async function processImage(
  sourcePath: string,
  config: ResolvedConfig,
): Promise<PhotoEntry> {
  const filename = path.basename(sourcePath);
  const { size: sourceBytes } = await stat(sourcePath);

  const image = sharp(sourcePath, { failOn: "error" });
  const metadata = await image.metadata();

  const thumbName = path.basename(filename, path.extname(filename)) +
    FORMAT_EXTENSION[config.format];
  const thumbPath = path.join(config.thumbsDir, thumbName);

  const pipeline = image
    .rotate() // honour EXIF orientation
    .resize({ width: config.size, withoutEnlargement: true });

  switch (config.format) {
    case "webp":
      pipeline.webp({ quality: config.quality });
      break;
    case "jpeg":
      pipeline.jpeg({ quality: config.quality });
      break;
    case "avif":
      pipeline.avif({ quality: config.quality });
      break;
    case "png":
      pipeline.png();
      break;
  }

  const thumbInfo = await pipeline.toFile(thumbPath);

  const album = config.album;
  const key = album ? `${album}/${filename}` : filename;
  const thumbKey = path.posix.join(
    path.basename(config.thumbsDir),
    thumbName,
  );

  return {
    id: randomUUID(),
    key,
    title: titleFromFilename(filename),
    description: null,
    album,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    sizeBytes: sourceBytes,
    mimeType: mimeFor(filename),
    originalFilename: filename,
    thumbnail: {
      key: thumbKey,
      width: thumbInfo.width,
      height: thumbInfo.height,
      sizeBytes: thumbInfo.size,
      format: config.format,
    },
    createdAt: new Date().toISOString(),
  };
}
