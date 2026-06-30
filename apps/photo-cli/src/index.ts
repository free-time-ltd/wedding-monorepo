import path from "node:path";

import { CliUsageError, HELP_TEXT, parseCliArgs } from "./cli/args";
import { isInteractive, Prompter } from "./cli/prompts";
import { resolveConfig } from "./cli/resolve";
import { buildManifest, writeManifest } from "./core/manifest";
import { processImage } from "./core/processor";
import { scanImages } from "./core/scanner";
import { ensureDir } from "./lib/fs";
import { color, logger } from "./lib/logger";
import type { PhotoEntry, ResolvedConfig } from "./types";

async function run(): Promise<void> {
  const opts = parseCliArgs();

  if (opts.help) {
    console.log(HELP_TEXT);
    return;
  }

  // Interactive only when we have a terminal and the user didn't pass --yes.
  const prompter = !opts.yes && isInteractive() ? new Prompter() : null;

  let config: ResolvedConfig;
  let sources: string[];
  try {
    config = await resolveConfig(opts, prompter);
    sources = await scanImages(config.inputDir, config.recursive);

    if (sources.length === 0) {
      logger.warn(`No supported images found in ${config.inputDir}`);
      return;
    }

    printSummary(config, sources.length);

    if (prompter && !(await prompter.confirm("Proceed?"))) {
      logger.info("Aborted.");
      return;
    }
  } finally {
    prompter?.close();
  }

  await ensureDir(config.thumbsDir);

  const photos: PhotoEntry[] = [];
  const failures: { file: string; reason: string }[] = [];

  for (const [i, source] of sources.entries()) {
    const name = path.basename(source);
    try {
      logger.step(i + 1, sources.length, name);
      photos.push(await processImage(source, config));
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      logger.error(`  failed: ${reason}`);
      failures.push({ file: name, reason });
    }
  }

  const manifest = buildManifest(config, photos);
  await writeManifest(config.manifestPath, manifest);

  logger.heading("Done");
  logger.success(`Processed ${photos.length}/${sources.length} image(s)`);
  logger.dim(`  thumbnails  ${config.thumbsDir}`);
  logger.dim(`  manifest    ${config.manifestPath}`);
  if (failures.length > 0) {
    logger.warn(`${failures.length} image(s) failed to process`);
  }
}

function printSummary(config: ResolvedConfig, count: number): void {
  logger.heading("photo-cli");
  logger.info(`Input      ${config.inputDir}`);
  logger.info(`Output     ${config.outDir}`);
  logger.info(`Album      ${config.album ?? color.dim("(none)")}`);
  logger.info(
    `Thumbnails ${count} image(s) → ${config.format} @ ${config.size}px / q${config.quality}`,
  );
}

run().catch((err) => {
  if (err instanceof CliUsageError) {
    logger.error(err.message);
    logger.dim("Run `photo-cli --help` for usage.");
  } else {
    logger.error(err instanceof Error ? err.message : String(err));
  }
  process.exit(1);
});
