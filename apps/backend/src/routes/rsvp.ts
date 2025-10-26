import { env } from "@/env";
import { RsvpInput, rsvpSchema } from "@/types";
import { eq, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { invitationTable } from "@repo/db/schema";
import { Hono } from "hono";
import { Resend } from "resend";
import { z } from "zod";

const rsvpRouter = new Hono();

rsvpRouter.get("/:id", async (c) => {
  const { id } = c.req.param();

  const guest = await db.query.usersTable.findFirst({
    where: (colums, { eq }) => eq(colums.id, id),
    with: {
      table: true,
      invitation: true,
    },
  });

  if (!guest) {
    return c.json({ success: false, error: "404 Not Found" }, { status: 404 });
  }

  if (guest.invitation) {
    await db
      .update(invitationTable)
      .set({
        views: sql`${invitationTable.views} + 1`,
      })
      .where(eq(invitationTable.id, guest.invitation.id));
  }

  return c.json({ success: true, data: guest });
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
    menuChoice,
    transportation,
    accommodation,
    notes,
  } = parsed.data;

  await db
    .insert(invitationTable)
    .values({
      userId: id,
      attending,
      plusOne,
      menuChoice,
      transportation,
      accommodation,
      notes: notes ?? null,
      createdAt: new Date(),
      views: 0,
    })
    .onConflictDoUpdate({
      target: [invitationTable.userId],
      set: {
        attending,
        plusOne,
        menuChoice,
        transportation,
        accommodation,
        notes: notes ?? null,
      },
    });

  const user = await db.query.usersTable.findFirst({
    where: (columns, { eq }) => eq(columns.id, id),
  });

  if (user) {
    const resend = new Resend(env.RESEND_KEY);

    const { error } = await resend.emails.send({
      from: `Wedding Mailer <${env.MAIL_ADDRESS_FROM}>`,
      to: ["ltsochev@live.com", "krisi.v.kostova@gmail.com"],
      subject: `RSVP update from: ${user.name}`,
      html: `${user.name} changed their RSVP status. Details below:`,
    });

    if (error) {
      console.error(error);
    }
  }

  return c.json({ success: true, message: "ok" });
});

export default rsvpRouter;
