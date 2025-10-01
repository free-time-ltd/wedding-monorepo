import { tablesTable, usersTable } from "@/db/schema";
import { db } from "@/db";
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

console.log({ generateId });

async function main() {
  const tablesRaw = Array.from({ length: 15 }, (_, i) => i + 1);
  const tables: TableInsertType[] = tablesRaw.map((id) => ({
    name: `Маса #${id}`,
  }));

  const users: UserInsertType[] = usernames.map((name) => ({
    id: generateId(),
    name,
    extras: 0,
    tableId: 1,
  }));

  await db.insert(tablesTable).values(tables);
  await db.insert(usersTable).values(users);
}

main();
