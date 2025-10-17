import { seed } from "@repo/db/seeder";

async function main() {
  await seed();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
