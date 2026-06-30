/**
 * Convert a photo-cli manifest into a self-contained SQL file that imports the
 * official photos into the `official_photos` table — no node/npm/tsx needed on
 * the target machine, just the `sqlite3` CLI.
 *
 * Run locally (you have tsx here), then ship the .sql to the VPS:
 *   npm run gallery:sql -- ../photo-cli/output/manifest.json > import.sql
 *   scp import.sql root@vps:/root/wedding/import.sql
 *   # on the VPS:
 *   sqlite3 /path/to/dbase.sqlite < /root/wedding/import.sql
 *
 * Like the DB importer, this wipes & replaces official_photos only (idempotent);
 * guest uploads / RSVPs are untouched.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

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
  photos: ManifestPhoto[];
}

// Quote a value as a SQLite literal. Strings get single quotes doubled.
function sql(value: string | number | null): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function toMs(iso: string): number {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Date.now() : t;
}

const COLUMNS =
  "id, s3_key, url, title, description, created_at, width, height, size_bytes, mime_type, album";
const CHUNK = 500;

function main(): void {
  const arg = process.argv[2];
  if (!arg) {
    process.stderr.write(
      "Usage: npm run gallery:sql -- <manifest.json> > import.sql\n",
    );
    process.exit(1);
  }

  const manifestPath = path.resolve(process.cwd(), arg);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;

  if (!Array.isArray(manifest.photos) || manifest.photos.length === 0) {
    process.stderr.write(`No photos found in ${manifestPath}\n`);
    process.exit(1);
  }

  const rows = manifest.photos.map(
    (p) =>
      `(${[
        sql(p.id),
        sql(p.key),
        "NULL", // url — frontend derives URLs from the key
        sql(p.title),
        sql(p.description ?? null),
        toMs(p.createdAt),
        sql(p.width ?? null),
        sql(p.height ?? null),
        sql(p.sizeBytes ?? null),
        sql(p.mimeType ?? null),
        sql(p.album ?? null),
      ].join(", ")})`,
  );

  const out: string[] = [];
  out.push(`-- ${rows.length} official photo(s) from ${path.basename(manifestPath)}`);
  out.push("BEGIN TRANSACTION;");
  out.push("DELETE FROM official_photos;");
  for (let i = 0; i < rows.length; i += CHUNK) {
    const part = rows.slice(i, i + CHUNK);
    out.push(`INSERT INTO official_photos (${COLUMNS}) VALUES`);
    out.push(part.join(",\n") + ";");
  }
  out.push("COMMIT;");

  process.stdout.write(out.join("\n") + "\n");
}

main();
