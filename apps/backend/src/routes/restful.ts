import { db } from "@repo/db/client";
import { Hono } from "hono";

const restRouter = new Hono();

restRouter.get("/api/users", async (c) => {
  const users = await db.query.usersTable.findMany({
    with: {
      table: true,
    },
  });

  return c.json({
    success: true,
    data: users.map((user) => ({
      ...user,
      table: { ...user.table, label: user.table?.label ?? user.table?.name },
    })),
  });
});

restRouter.get("/api/tables", async (c) => {
  const tables = await db.query.tablesTable.findMany({
    with: {
      guests: {
        columns: {
          id: true,
          name: true,
          extras: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: tables.map((table) => ({
      ...table,
      label: table.label ?? table.name,
    })),
  });
});

export default restRouter;
