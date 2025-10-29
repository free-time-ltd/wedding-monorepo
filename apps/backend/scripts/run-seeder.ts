import "dotenv/config";

import { seed, seedImages } from "@repo/db/seeder";

async function main() {
  await seed();
  await seedImages();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
