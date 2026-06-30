import path from "node:path";

import { CliUsageError, HELP_TEXT, parseCliArgs } from "./cli/args";
import { isInteractive, Prompter } from "./cli/prompts";
import { resolveConfig } from "./cli/resolve";
import { buildManifest, writeManifest } from "./core/manifest";
import { keyFromFilename, processImage } from "./core/processor";
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

  await Promise.all([
    ensureDir(config.originalsDir),
    ensureDir(path.join(config.processedDir, "thumbnail")),
    ensureDir(path.join(config.processedDir, "medium")),
    ensureDir(path.join(config.processedDir, "full")),
  ]);

  const photos: PhotoEntry[] = [];
  const failures: { file: string; reason: string }[] = [];

  // Keys derive from filenames; suffix duplicates so nothing is overwritten.
  const keyCounts = new Map<string, number>();
  const uniqueKey = (filename: string): string => {
    const base = keyFromFilename(filename);
    const n = keyCounts.get(base) ?? 0;
    keyCounts.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  };

  for (const [i, source] of sources.entries()) {
    const name = path.basename(source);
    try {
      logger.step(i + 1, sources.length, name);
      photos.push(await processImage(source, config, uniqueKey(name)));
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
  logger.dim(`  originals   ${config.originalsDir}`);
  logger.dim(`  processed   ${config.processedDir}`);
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
    `Renditions ${count} image(s) → webp @ ${config.size}/1280/2048px / q${config.quality} + original`,
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
