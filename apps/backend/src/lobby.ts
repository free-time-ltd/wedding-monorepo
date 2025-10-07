import { db } from "@repo/db/client";

export async function defineLobby() {
  const users = await db.query.usersTable.findMany({
    with: {
      table: true,
    },
  });

  return {
    id: "lobby",
    name: "Lobby",
    isPrivate: false,
    guests: users.map((user) => ({
      ...user,
      table: {
        ...user.table,
        label: user.table?.label ?? user.table?.name,
      },
    })),
  };
}
