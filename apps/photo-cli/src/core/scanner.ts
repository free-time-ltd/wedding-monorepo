import { readdir } from "node:fs/promises";
import path from "node:path";

import { SUPPORTED_EXTENSIONS } from "../config";
import { pathKind } from "../lib/fs";

const isSupported = (file: string): boolean =>
  SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase());

/**
 * Discover image files under `input`. `input` may be a single image file or a
 * directory; directories are scanned (optionally recursively) and the results
 * are returned sorted for deterministic output.
 */
export async function scanImages(
  input: string,
  recursive: boolean,
): Promise<string[]> {
  const kind = await pathKind(input);

  if (kind === "missing") {
    throw new Error(`Input path does not exist: ${input}`);
  }

  if (kind === "file") {
    if (!isSupported(input)) {
      throw new Error(`Unsupported file type: ${path.basename(input)}`);
    }
    return [path.resolve(input)];
  }

  const found = await collect(path.resolve(input), recursive);
  return found.sort((a, b) => a.localeCompare(b));
}

async function collect(dir: string, recursive: boolean): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) files.push(...(await collect(full, recursive)));
    } else if (entry.isFile() && isSupported(entry.name)) {
      files.push(full);
    }
  }

  return files;
}
