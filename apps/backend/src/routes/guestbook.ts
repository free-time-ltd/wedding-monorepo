import { requireAuth } from "@/middleware";
import { errorResponse, successResponse } from "@/reponses";
import { guestbookInputSchema, SimpleAuthContext } from "@/types";
import { and, eq, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { guestbookLikesTable, guestbookTable } from "@repo/db/schema";
import { Hono } from "hono";
import z from "zod";

const guestbookRouter = new Hono();

guestbookRouter.get("/", async (c) => {
  const approvedMessages = await db.query.guestbookTable.findMany({
    where: (table, { and, eq }) =>
      and(eq(table.isApproved, true), eq(table.isPrivate, false)),
    with: {
      user: true,
      likes: {
        columns: {
          userId: true,
          createdAt: true,
        },
      },
    },
  });

  return successResponse(
    c,
    approvedMessages.map((message) => ({
      ...message,
      likes: message.likes.map((like) => like.userId),
    }))
  );
});

guestbookRouter.post("/", requireAuth, async (c: SimpleAuthContext) => {
  const userId = c.get("userId");
  const body =
    c.req.header("Content-Type") === "application/json"
      ? await c.req.json()
      : await c.req.parseBody({ all: true, dot: true });

  const parsed = guestbookInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { success: false, error: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }

  const { title, message, private: isPrivate } = parsed.data;

  await db.insert(guestbookTable).values({
    userId,
    title,
    message,
    isPrivate,
  });

  return successResponse(c, "ok");
});

guestbookRouter.post("/:id/like", requireAuth, async (c: SimpleAuthContext) => {
  const { id } = c.req.param();
  const userId = c.get("userId");

  const guestbook = await db.query.guestbookTable.findFirst({
    where: (table, { eq }) => eq(table.id, Number(id)),
    with: { likes: true },
  });

  if (!guestbook) {
    return errorResponse(c, "Guestbook not found", 404);
  }

  let liked = false;

  await db.transaction(async (tx) => {
    try {
      await tx.insert(guestbookLikesTable).values({
        guestbookId: Number(id),
        userId,
      });

      await tx
        .update(guestbookTable)
        .set({ likesCount: sql`${guestbookTable.likesCount} + 1` })
        .where(eq(guestbookTable.id, Number(id)));

      liked = true;
    } catch {
      await tx
        .delete(guestbookLikesTable)
        .where(
          and(
            eq(guestbookLikesTable.guestbookId, Number(id)),
            eq(guestbookLikesTable.userId, userId)
          )
        );

      await tx
        .update(guestbookTable)
        .set({ likesCount: sql`${guestbookTable.likesCount} - 1` })
        .where(eq(guestbookTable.id, Number(id)));

      liked = false;
    }
  });

  return successResponse(c, { liked });
});

export default guestbookRouter;
