import { mkdir, stat } from "node:fs/promises";

/** Create a directory (and parents) if it does not already exist. */
export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/** Resolve what a path points at, without throwing on a missing path. */
export async function pathKind(
  target: string,
): Promise<"file" | "directory" | "missing"> {
  try {
    const stats = await stat(target);
    return stats.isDirectory() ? "directory" : "file";
  } catch {
    return "missing";
  }
}
