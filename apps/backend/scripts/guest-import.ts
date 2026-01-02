import "dotenv/config";
import fs from "fs";
import { db } from "@repo/db/client";
import { usersTable } from "@repo/db/schema";
import { pluralizeWithCount } from "@repo/utils/pluralize";

async function guestImport() {
  const data = fs.readFileSync("./scripts/guestlist-raw.csv", "utf8");

  const rows = data
    .trim()
    .split("\r\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== "1");

  await db
    .insert(usersTable)
    .values(
      rows.map((name) => ({
        name,
      }))
    )
    .onConflictDoNothing();

  console.log(
    `Total of ${pluralizeWithCount(rows.length, "guest", "guests")} have been processed.`
  );
}

guestImport();
