import { requireAuth } from "@/middleware";
import { errorResponse, successResponse } from "@/reponses";
import { PollService } from "@/services/polls-service";
import { SimpleAuthContext } from "@/types";
import { getUserId } from "@/utils";
import { db } from "@repo/db/client";
import { Hono } from "hono";

const pollsRouter = new Hono();
const pollService = new PollService(db);

pollsRouter.get("/", async (c) => {
  const userId = await getUserId(c);

  const polls = await pollService.getPollsWithDetails();
  const totalVotes = await pollService.getTotalVotes();
  const userVotes = await pollService.getTotalVotesByUser(userId);

  return successResponse(c, {
    polls: pollService.transformDetailedPoll(polls, userId),
    totalVotes,
    userVotes,
  });
});

pollsRouter.post("/:id", requireAuth, async (c: SimpleAuthContext) => {
  const { id: pollId } = c.req.param();
  const userId = c.get("userId");

  const poll = await pollService.findPoll(pollId);

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

  if (poll.validUntil! <= new Date()) {
    return errorResponse(c, "Poll has expired", 403);
  }

  await pollService.upsertPollAnswer({
    userId,
    pollId,
    answer,
  });

  const updatedPoll = await pollService.findPollDetailed(pollId);
  if (!updatedPoll) {
    return errorResponse(c, "Unexpected poll missing error.", 404);
  }

  return successResponse(c, pollService.transformPoll(updatedPoll, userId));
});

export default pollsRouter;
