import { writeFile } from "node:fs/promises";

import type { Manifest, PhotoEntry, ResolvedConfig } from "../types";

/** Assemble the manifest document from processed photo entries. */
export function buildManifest(
  config: ResolvedConfig,
  photos: PhotoEntry[],
): Manifest {
  return {
    generatedAt: new Date().toISOString(),
    sourceDir: config.inputDir,
    album: config.album,
    thumbnail: {
      format: config.format,
      maxWidth: config.size,
      quality: config.quality,
    },
    count: photos.length,
    photos,
  };
}

/** Write the manifest as pretty-printed JSON. */
export async function writeManifest(
  manifestPath: string,
  manifest: Manifest,
): Promise<void> {
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}
