import { env } from "@/env";
import { MailerService } from "@/services/mailer/mailer-service";
import { RsvpRepository } from "@/services/rsvp/rsvp-repository";
import { RsvpInput, rsvpSchema } from "@/types";
import { eq, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { invitationTable } from "@repo/db/schema";
import { Hono } from "hono";
import { z } from "zod";

const rsvpRouter = new Hono();

rsvpRouter.get("/:id", async (c) => {
  const { id } = c.req.param();

  const guestRes = await db.query.usersTable.findFirst({
    where: (colums, { eq }) => eq(colums.id, id),
    with: {
      table: true,
      invitation: true,
    },
  });

  if (!guestRes) {
    return c.json({ success: false, error: "404 Not Found" }, { status: 404 });
  }

  // Detect role
  const isInvited = await db.query.invitationUsers.findFirst({
    where: (table, { eq }) => eq(table.invitedUserId, id),
  });

  const role = isInvited ? "invitee" : "guest";
  const invitedBy = isInvited ? isInvited.userId : null;

  const { invitation, ...guest } = guestRes;

  if (invitation) {
    await db
      .update(invitationTable)
      .set({
        views: sql`${invitationTable.views} + 1`,
      })
      .where(eq(invitationTable.id, invitation.id));
  }

  return c.json({
    success: true,
    data: { guest, invitation, role, invitedBy },
  });
});

rsvpRouter.post("/:id", async (c) => {
  const { id } = c.req.param();

  // Parse the body
  const body = (c.req.header("Content-Type") === "application/json"
    ? await c.req.json()
    : await c.req.parseBody({ all: true, dot: true })) as unknown as RsvpInput;

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { success: false, error: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }

  const {
    attending,
    plusOne,
    extraGuests,
    menuChoice,
    transportation,
    accommodation,
    notes,
  } = parsed.data;

  const plusOneNames =
    !!extraGuests &&
    extraGuests
      .split(",")
      .map((str) => str.trim())
      .filter(Boolean);

  const rsvpRepo = new RsvpRepository(db);

  await rsvpRepo.createRsvp({
    userId: id,
    attending,
    plusOne,
    plusOneNames,
    menuChoice,
    transportation,
    accommodation,
    notes: notes ?? null,
    createdAt: new Date(),
    views: 0,
  });

  const user = await db.query.usersTable.findFirst({
    where: (columns, { eq }) => eq(columns.id, id),
  });

  if (user) {
    const mailer = new MailerService(env.RESEND_KEY, Boolean(env.MAIL_PRETEND));

    const { error } = await mailer.send({
      from: `Wedding Mailer <${env.MAIL_ADDRESS_FROM}>`,
      to: ["ltsochev@live.com", "krisi.v.kostova@gmail.com"],
      subject: `RSVP update from: ${user.name}`,
      html: `${user.name} changed their RSVP status.`,
    });

    if (error) {
      console.error(error);
    }
  }

  return c.json({ success: true, message: "ok" });
});

export default rsvpRouter;
