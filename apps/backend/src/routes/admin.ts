import { db } from "@repo/db/client";
import { Hono } from "hono";
import {
  usersTable,
  tablesTable,
  invitationTable,
  guestUploadsTable,
  newsletterTable,
} from "@repo/db/schema";
import { eq, desc } from "@repo/db";
import { successResponse } from "@/reponses";

const adminRouter = new Hono();

// USERS ROUTES
adminRouter.get("/users", async (c) => {
  const users = await db.query.usersTable.findMany({
    with: {
      table: true,
      invitation: true,
      uploads: true,
    },
  });

  return c.json({
    success: true,
    data: users,
  });
});

adminRouter.get("/users/:id", async (c) => {
  const { id } = c.req.param();

  const user = await db.query.usersTable.findFirst({
    where: (columns, { eq }) => eq(columns.id, id),
    with: {
      table: true,
      invitation: true,
      uploads: true,
    },
  });

  if (!user) {
    return c.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return c.json({ success: true, data: user });
});

adminRouter.post("/users", async (c) => {
  const body = await c.req.json();
  const { name, extras, email, phone, tableId } = body;

  const [newUser] = await db
    .insert(usersTable)
    .values({
      name,
      extras: extras ?? 0,
      email: email ?? null,
      phone: phone ?? null,
      tableId: tableId ?? null,
    })
    .returning();

  return c.json({ success: true, data: newUser });
});

adminRouter.patch("/users/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const [updatedUser] = await db
    .update(usersTable)
    .set(body)
    .where(eq(usersTable.id, id))
    .returning();

  return c.json({ success: true, data: updatedUser });
});

adminRouter.delete("/users/:id", async (c) => {
  const { id } = c.req.param();

  await db.delete(usersTable).where(eq(usersTable.id, id));

  return c.json({ success: true });
});

// TABLES ROUTES
adminRouter.get("/tables", async (c) => {
  const tables = await db.query.tablesTable.findMany({
    with: {
      guests: true,
    },
  });

  return c.json({
    success: true,
    data: tables,
  });
});

adminRouter.get("/tables/:id", async (c) => {
  const { id } = c.req.param();

  const table = await db.query.tablesTable.findFirst({
    where: (columns, { eq }) => eq(columns.id, Number(id)),
    with: {
      guests: true,
    },
  });

  if (!table) {
    return c.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return c.json({ success: true, data: table });
});

adminRouter.post("/tables", async (c) => {
  const body = await c.req.json();
  const { name, label } = body;

  const [newTable] = await db
    .insert(tablesTable)
    .values({
      name,
      label: label ?? null,
    })
    .returning();

  return c.json({ success: true, data: newTable });
});

adminRouter.patch("/tables/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const [updatedTable] = await db
    .update(tablesTable)
    .set(body)
    .where(eq(tablesTable.id, Number(id)))
    .returning();

  return c.json({ success: true, data: updatedTable });
});

adminRouter.delete("/tables/:id", async (c) => {
  const { id } = c.req.param();

  await db.delete(tablesTable).where(eq(tablesTable.id, Number(id)));

  return c.json({ success: true });
});

// INVITATIONS ROUTES
adminRouter.get("/invitations", async (c) => {
  const invitations = await db.query.invitationTable.findMany({
    with: {
      user: true,
    },
    orderBy: [desc(invitationTable.createdAt)],
  });

  return c.json({
    success: true,
    data: invitations,
  });
});

adminRouter.get("/invitations/:id", async (c) => {
  const { id } = c.req.param();

  const invitation = await db.query.invitationTable.findFirst({
    where: (columns, { eq }) => eq(columns.id, Number(id)),
    with: {
      user: true,
    },
  });

  if (!invitation) {
    return c.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return c.json({ success: true, data: invitation });
});

adminRouter.patch("/invitations/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const [updatedInvitation] = await db
    .update(invitationTable)
    .set(body)
    .where(eq(invitationTable.id, Number(id)))
    .returning();

  return c.json({ success: true, data: updatedInvitation });
});

// GUEST UPLOADS ROUTES
adminRouter.get("/uploads", async (c) => {
  const uploads = await db.query.guestUploadsTable.findMany({
    with: {
      user: true,
    },
    orderBy: [desc(guestUploadsTable.createdAt)],
  });

  return c.json({
    success: true,
    data: uploads,
  });
});

adminRouter.patch("/uploads/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const [updatedUpload] = await db
    .update(guestUploadsTable)
    .set(body)
    .where(eq(guestUploadsTable.id, id))
    .returning();

  return c.json({ success: true, data: updatedUpload });
});

adminRouter.delete("/uploads/:id", async (c) => {
  const { id } = c.req.param();

  await db.delete(guestUploadsTable).where(eq(guestUploadsTable.id, id));

  return c.json({ success: true });
});

// Newsletter
adminRouter.get("/newsletter", async (c) => {
  const newsletter = await db.query.newsletterTable.findMany({
    with: {
      user: true,
    },
    orderBy: (table, { desc }) => desc(table.id),
  });

  return successResponse(c, newsletter);
});

adminRouter.patch("/newsletter/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const [newsletter] = await db
    .update(newsletterTable)
    .set(body)
    .where(eq(newsletterTable.id, id))
    .returning();

  return successResponse(c, newsletter);
});

adminRouter.delete("/newsletter/:id", async (c) => {
  const { id } = c.req.param();

  await db.delete(newsletterTable).where(eq(newsletterTable.id, id));

  return c.json({ success: true });
});

export default adminRouter;
