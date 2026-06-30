import { parseArgs } from "node:util";

import {
  DEFAULT_OUT_DIR,
  DEFAULT_QUALITY,
  DEFAULT_THUMB_SIZE,
} from "../config";
import type { CliOptions } from "../types";

export const HELP_TEXT = `
photo-cli — prepare wedding photos for the gallery

Usage:
  photo-cli <input> [options]

Arguments:
  <input>                 Path to an image or a directory of images to import

Each image is written as three webp renditions (thumbnail/medium/full) plus a
copy of the original, laid out to mirror the S3 bucket so the output dir can be
shipped with a single \`aws s3 sync\`.

Options:
  -o, --out <dir>         Output directory for renditions and the manifest
                          (default: "${DEFAULT_OUT_DIR}")
  -a, --album <name>      Album name applied to every photo
  -s, --size <px>         Max width of the thumbnail rendition (default: ${DEFAULT_THUMB_SIZE})
  -q, --quality <1-100>   Webp quality for the renditions (default: ${DEFAULT_QUALITY})
  -r, --recursive         Scan sub-directories
  -y, --yes               Skip interactive prompts and accept defaults
  -h, --help              Show this help

Examples:
  photo-cli ./photos
  photo-cli ./photos --out ./gallery --album "Ceremony" --size 600
  photo-cli ./photos -r -q 70 -y
`;

/** Thrown when the provided arguments are invalid. */
export class CliUsageError extends Error {}

function parsePositiveInt(value: string, flag: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new CliUsageError(`${flag} must be a positive integer (got "${value}")`);
  }
  return n;
}

/** Parse `argv` into validated {@link CliOptions}. */
export function parseCliArgs(argv: string[] = process.argv.slice(2)): CliOptions {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        out: { type: "string", short: "o" },
        album: { type: "string", short: "a" },
        size: { type: "string", short: "s" },
        quality: { type: "string", short: "q" },
        recursive: { type: "boolean", short: "r", default: false },
        yes: { type: "boolean", short: "y", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
    });
  } catch (err) {
    throw new CliUsageError(err instanceof Error ? err.message : String(err));
  }

  const { values, positionals } = parsed;

  if (positionals.length > 1) {
    throw new CliUsageError(
      `Expected a single input path but got ${positionals.length}. ` +
        `Quote paths that contain spaces.`,
    );
  }

  const quality = values.quality
    ? parsePositiveInt(values.quality, "--quality")
    : undefined;
  if (quality !== undefined && quality > 100) {
    throw new CliUsageError(`--quality must be between 1 and 100 (got ${quality})`);
  }

  return {
    input: positionals[0],
    out: values.out,
    album: values.album,
    size: values.size ? parsePositiveInt(values.size, "--size") : undefined,
    quality,
    recursive: values.recursive ?? false,
    yes: values.yes ?? false,
    help: values.help ?? false,
  };
}
