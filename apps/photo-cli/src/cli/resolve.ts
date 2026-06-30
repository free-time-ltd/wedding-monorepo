import path from "node:path";

import {
  DEFAULT_OUT_DIR,
  DEFAULT_QUALITY,
  DEFAULT_THUMB_SIZE,
  MANIFEST_FILENAME,
  ORIGINALS_SUBDIR,
  PROCESSED_SUBDIR,
} from "../config";
import type { CliOptions, ResolvedConfig } from "../types";
import type { Prompter } from "./prompts";

/**
 * Merge parsed CLI options with defaults, filling any gaps interactively when a
 * {@link Prompter} is available. Pure flag values always win over prompts.
 */
export async function resolveConfig(
  opts: CliOptions,
  prompter: Prompter | null,
): Promise<ResolvedConfig> {
  let input = opts.input;
  if (!input && prompter) {
    input = await prompter.ask("Path to images");
  }
  if (!input) {
    throw new Error(
      "No input path provided. Pass a path (e.g. `photo-cli ./photos`) or run with --help.",
    );
  }

  let album = opts.album ?? null;
  if (opts.album === undefined && prompter) {
    const answer = await prompter.ask("Album name (leave blank for none)");
    album = answer || null;
  }

  const outDir = path.resolve(opts.out ?? DEFAULT_OUT_DIR);

  return {
    inputDir: path.resolve(input),
    outDir,
    originalsDir: path.join(outDir, ORIGINALS_SUBDIR),
    processedDir: path.join(outDir, PROCESSED_SUBDIR),
    manifestPath: path.join(outDir, MANIFEST_FILENAME),
    album,
    size: opts.size ?? DEFAULT_THUMB_SIZE,
    quality: opts.quality ?? DEFAULT_QUALITY,
    recursive: opts.recursive,
  };
}
