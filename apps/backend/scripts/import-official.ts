import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@repo/db/client";
import { officialPhotosTable } from "@repo/db/schema";

/**
 * Import a photo-cli manifest into the `official_photos` table.
 *
 * Usage:
 *   npm run gallery:import -- ../photo-cli/output/manifest.json
 *
 * The official set is treated as a single source of truth: existing rows are
 * wiped and replaced, so re-running with an updated manifest is idempotent.
 * (This only touches official_photos — guest uploads are untouched.)
 */

interface ManifestPhoto {
  id: string;
  key: string;
  title: string;
  description: string | null;
  album: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  createdAt: string;
}

interface Manifest {
  count: number;
  photos: ManifestPhoto[];
}

const CHUNK = 80; // 11 columns/row keeps us well under SQLite's variable limit

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) {
    throw new Error(
      "Pass the manifest path, e.g. `npm run gallery:import -- ./output/manifest.json`",
    );
  }

  const manifestPath = path.resolve(process.cwd(), arg);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;

  if (!Array.isArray(manifest.photos) || manifest.photos.length === 0) {
    throw new Error(`No photos found in ${manifestPath}`);
  }

  const rows = manifest.photos.map((p) => ({
    id: p.id,
    key: p.key,
    url: null,
    title: p.title,
    description: p.description ?? null,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    width: p.width ?? null,
    height: p.height ?? null,
    sizeBytes: p.sizeBytes ?? null,
    mimeType: p.mimeType ?? null,
    album: p.album ?? null,
  }));

  await db.transaction(async (tx) => {
    await tx.delete(officialPhotosTable);
    for (const part of chunk(rows, CHUNK)) {
      await tx.insert(officialPhotosTable).values(part);
    }
  });

  console.log(`✅ Imported ${rows.length} official photo(s) from ${manifestPath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
