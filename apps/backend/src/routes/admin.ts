import { db } from "@repo/db/client";
import { Hono } from "hono";
import {
  usersTable,
  tablesTable,
  invitationTable,
  guestUploadsTable,
  newsletterTable,
  pollsTable,
  pollOptionsTable,
  invitationUsers,
  nearbyHotels,
  guestbookTable,
  urlShortenerTable,
} from "@repo/db/schema";
import { eq, desc, count, sql } from "@repo/db";
import { errorResponse, successResponse } from "@/reponses";
import { PollService } from "@/services/polls-service";

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
  const { name, extras, email, phone, tableId, gender } = body;

  const [newUser] = await db
    .insert(usersTable)
    .values({
      name,
      extras: extras ?? 0,
      email: email ?? null,
      phone: phone ?? null,
      gender: gender ?? "unknown",
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
      invited: true,
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

adminRouter.post("invitations/:id/guests", async (c) => {
  const { id } = c.req.param();
  const { userId, guests = [] } = await c.req.json();

  await db
    .delete(invitationUsers)
    .where(eq(invitationUsers.invitationId, Number(id)));

  const users = await db
    .insert(usersTable)
    .values(
      guests.map(
        (guest: { name: string; gender: "male" | "female" | "unknown" }) => ({
          name: guest.name.trim(),
          gender: guest.gender,
        })
      )
    )
    .onConflictDoUpdate({
      target: [usersTable.name],
      set: {
        gender: sql`excluded.gender`,
      },
    })
    .returning();

  await db.insert(invitationUsers).values(
    users.map((user) => ({
      invitationId: Number(id),
      userId,
      invitedUserId: user.id,
      createdAt: new Date(),
    }))
  );

  return c.json({
    success: true,
    data: "ok",
  });
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

// Routes for polls
adminRouter.get("/polls", async (c) => {
  const pollService = new PollService(db);

  const polls = await pollService.getPollsWithDetails();

  return successResponse(c, polls);
});

adminRouter.post("/polls", async (c) => {
  const body = await c.req.json();
  const pollService = new PollService(db);
  const { title, subtitle, options = [], validUntil } = body;

  if (Array.from(options).length === 0) {
    return errorResponse(c, "You need at least 1 option", 403);
  }

  const [poll] = await db
    .insert(pollsTable)
    .values({
      title,
      subtitle,
      validUntil: new Date(validUntil ?? "2026-06-27"),
    })
    .returning();

  if (!poll) {
    return errorResponse(c, "Something went wrong creating a poll.");
  }

  await db.insert(pollOptionsTable).values(
    // @ts-expect-error I'm too lazy to write types for the option really
    options.map((option) => ({
      pollId: poll.id,
      title: option.title,
    }))
  );

  const newPoll = await pollService.findPollDetailed(poll.id);

  return successResponse(c, newPoll);
});

adminRouter.patch("/polls/:id", async (c) => {
  const { id: pollId } = c.req.param();
  const body = await c.req.json();

  const pollService = new PollService(db);
  const poll = await pollService.findPollDetailed(pollId);

  if (!poll) {
    return errorResponse(c, "Poll not found", 404);
  }

  const { title, subtitle, options = [] } = body;

  if (Array.from(options).length === 0) {
    return errorResponse(c, "You need at least 1 option", 403);
  }

  await db
    .update(pollsTable)
    .set({ title, subtitle })
    .where(eq(pollsTable.id, poll.id));

  Array.from(options).forEach(async (option) => {
    await db
      .update(pollOptionsTable)
      // @ts-expect-error I'm too lazy to write types for the option really
      .set({ title: option.title })
      // @ts-expect-error I'm too lazy to write types for the option really
      .where(eq(pollOptionsTable.id, option.id));
  });

  const newPoll = await pollService.findPollDetailed(pollId);

  return successResponse(c, newPoll);
});

adminRouter.delete("/polls/:id", async (c) => {
  const { id } = c.req.param();

  await db.delete(pollsTable).where(eq(pollsTable.id, id));

  return successResponse(c, "ok");
});

adminRouter.delete("/polls/:id/:option", async (c) => {
  const { id: pollId, option } = c.req.param();

  const optionCount =
    (await db.select({ count: count() }).from(pollOptionsTable)).at(0)?.count ??
    0;

  if (optionCount <= 1) {
    return errorResponse(c, "You need at least 1 option left.");
  }

  await db.delete(pollOptionsTable).where(eq(pollOptionsTable.id, option));

  const pollService = new PollService(db);

  const poll = pollService.findPollDetailed(pollId);

  return successResponse(c, poll);
});

// Routes for hotels
adminRouter.get("/hotels", async (c) => {
  const hotels = await db.query.nearbyHotels.findMany();

  return c.json({ success: true, data: hotels });
});

adminRouter.post("/hotels", async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, ...body } = await c.req.json();

  await db.insert(nearbyHotels).values(body);

  return successResponse(c, "ok");
});

adminRouter.put("/hotels/:id", async (c) => {
  const { id } = c.req.param();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt: _, ...body } = await c.req.json();

  const hotel = await db.query.nearbyHotels.findFirst({
    where: (table, { eq }) => eq(table.id, Number(id)),
  });

  if (!hotel) {
    return errorResponse(c, "Hotel not found", 404);
  }

  await db
    .update(nearbyHotels)
    .set(body)
    .where(eq(nearbyHotels.id, Number(id)));

  return successResponse(c, "ok");
});

adminRouter.delete("/hotels/:id", async (c) => {
  const { id } = c.req.param();

  await db.delete(nearbyHotels).where(eq(nearbyHotels.id, Number(id)));

  return successResponse(c, "ok");
});

adminRouter.get("/guestbook", async (c) => {
  const messages = await db.query.guestbookTable.findMany({
    with: { user: true },
    orderBy: (table, { desc }) => desc(table.id),
  });

  return successResponse(c, messages);
});

adminRouter.patch("/guestbook/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const message = await db.query.guestbookTable.findFirst({
    where: (table, { eq }) => eq(table.id, Number(id)),
  });

  if (!message) {
    return errorResponse(c, "Message not found", 404);
  }

  await db
    .update(guestbookTable)
    .set({
      isApproved: "isApproved" in body ? body.isApproved : message.isApproved,
      isPrivate: "isPrivate" in body ? body.isPrivate : message.isPrivate,
    })
    .where(eq(guestbookTable.id, Number(id)));

  return successResponse(c, "ok");
});

adminRouter.delete("/guestbook/:id", async (c) => {
  const { id } = c.req.param();

  await db.delete(guestbookTable).where(eq(guestbookTable.id, Number(id)));

  return successResponse(c, "ok");
});

adminRouter.get("/url-shortener", async (c) => {
  const urls = await db.query.urlShortenerTable.findMany({
    with: { user: true },
  });

  return successResponse(c, urls);
});

adminRouter.post("/url-shortener", async (c) => {
  const body = await c.req.json();

  await db.insert(urlShortenerTable).values(body);

  return successResponse(c, "ok");
});

adminRouter.delete("/url-shortener/:id", async (c) => {
  const { id } = c.req.param();

  await db
    .delete(urlShortenerTable)
    .where(eq(urlShortenerTable.id, Number(id)));

  return successResponse(c, "ok");
});

adminRouter.patch("/url-shortener/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  await db
    .update(urlShortenerTable)
    .set(body)
    .where(eq(urlShortenerTable.id, Number(id)));

  return successResponse(c, "ok");
});

export default adminRouter;
