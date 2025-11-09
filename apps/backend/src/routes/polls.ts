import { requireAuth } from "@/middleware";
import { errorResponse, successResponse } from "@/reponses";
import { SimpleAuthContext } from "@/types";
import { db } from "@repo/db/client";
import { pollAnswersTable } from "@repo/db/schema";
import { Hono } from "hono";

const pollsRouter = new Hono();

pollsRouter.get("/", async (c) => {
  const polls = await db.query.pollsTable.findMany({
    with: {
      options: {
        columns: {
          id: true,
          title: true,
        },
        orderBy: (table, { asc }) => asc(table.id),
      },
      answers: {
        with: {
          answer: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return successResponse(c, polls);
});

pollsRouter.post("/:id", requireAuth, async (c: SimpleAuthContext) => {
  const { id: pollId } = c.req.param();
  const userId = c.get("userId");

  const poll = await db.query.pollsTable.findFirst({
    where: (table, { eq }) => eq(table.id, pollId),
    with: {
      options: true,
    },
  });

  if (!poll || !userId) {
    return errorResponse(c, "Poll or user not found", 404);
  }

  // Parse the body
  const body =
    c.req.header("Content-Type") === "application/json"
      ? await c.req.json()
      : await c.req.parseBody({ all: true, dot: true });

  if (!("answer" in body)) {
    return errorResponse(c, "Missing answer field", 403);
  }

  const { answer } = body;

  if (!poll.options.map((option) => option.id).includes(answer)) {
    return errorResponse(c, "Option not available in poll", 403);
  }

  await db
    .insert(pollAnswersTable)
    .values({
      userId,
      pollId,
      answer,
    })
    .onConflictDoUpdate({
      target: [pollAnswersTable.userId, pollAnswersTable.pollId],
      set: {
        answer,
      },
    });

  return successResponse(c, "ok");
});

export default pollsRouter;
