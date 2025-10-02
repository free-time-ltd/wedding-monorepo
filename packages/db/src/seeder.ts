import { tablesTable, usersTable } from "./schema";
import { db } from "./client";
import { generateId } from "@repo/utils/generateId";

const usernames = [
  "Лъчезар Цочев",
  "Кристина Костова",
  "Мария Нешева",
  "Стоян Капитанов",
  "Лъчезар Капитанов",
  "Александър Костов",
  "Христина Костова",
];

type UserInsertType = typeof usersTable.$inferInsert;
type TableInsertType = typeof tablesTable.$inferInsert;

export async function seed() {
  const tablesRaw = Array.from({ length: 15 }, (_, i) => i + 1);
  const tables: TableInsertType[] = tablesRaw.map((id) => ({
    name: `Маса #${id}`,
    label: "Лъчо колеги",
  }));

  const users: UserInsertType[] = usernames.map((name) => ({
    id: generateId(),
    name,
    extras: 0,
    tableId: 1,
  }));

  await db.insert(tablesTable).values(tables);
  await db.insert(usersTable).values(users);

  console.log("✅ Seeder completed successfully.");
}
