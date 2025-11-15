import mapByKey from "@repo/utils/mapByKey";
import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import { pollAnswersTable } from "@repo/db/schema";

type Connection = typeof db;

export type PollWithDetails = NonNullable<
  Awaited<ReturnType<PollService["getPollsWithDetails"]>>
>[number];

export type PollWithOptions = NonNullable<
  Awaited<ReturnType<PollService["getPollsByIds"]>>
>;

export type PollModel = NonNullable<ReturnType<PollService["transformPoll"]>>;

export class PollService {
  private db: Connection;

  constructor(conn: Connection) {
    this.db = conn;
  }

  findPoll(pollId: string) {
    return db.query.pollsTable.findFirst({
      where: (table, { eq }) => eq(table.id, pollId),
      with: {
        options: true,
      },
    });
  }

  findPollDetailed(pollId: string) {
    return this.db.query.pollsTable.findFirst({
      where: (table, { eq }) => eq(table.id, pollId),
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
  }

  getPollsWithDetails() {
    return this.db.query.pollsTable.findMany({
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
  }

  async getPollsByIds(pollIds: string[]) {
    const polls = await this.db.query.pollsTable.findMany({
      where: (table, { inArray }) => inArray(table.id, pollIds),
      with: {
        options: true,
      },
    });

    return mapByKey(polls, "id");
  }

  async getPollsByAnswers(answers: Array<{ pollId: string }>) {
    const pollIds = answers.map((answer) => answer.pollId);

    return this.getPollsByIds(pollIds);
  }

  async getOptionsByIds(optionIds: string[]) {
    const options = await this.db.query.pollOptionsTable.findMany({
      where: (table, { inArray }) => inArray(table.id, optionIds),
    });

    return mapByKey(options, "id");
  }

  async getOptionsByAnswers(answers: Array<{ optionId: string }>) {
    const optionIds = answers.map((answer) => answer.optionId);
    return this.getOptionsByIds(optionIds);
  }

  async getTotalVotes() {
    return (
      (await db.select({ count: count() }).from(pollAnswersTable)).at(0)
        ?.count ?? 0
    );
  }

  async getTotalVotesByUser(userId: string | null) {
    if (!userId) return 0;

    return (
      (
        await this.db
          .select({ count: count() })
          .from(pollAnswersTable)
          .where(eq(pollAnswersTable.userId, userId))
      ).at(0)?.count ?? 0
    );
  }

  async upsertPollAnswer(params: {
    userId: string;
    pollId: string;
    answer: string;
  }) {
    const { userId, pollId, answer } = params;

    return this.db
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
  }

  async upsertPollAnswers(
    answers: Array<{
      userId: string;
      pollId: string;
      answer: string;
    }>
  ) {
    return Promise.all(answers.map((answer) => this.upsertPollAnswer(answer)));
  }

  transformDetailedPoll(polls: PollWithDetails[], userId?: string | null) {
    return polls.map((poll) => this.transformPoll(poll, userId));
  }

  transformPoll(
    { id, title, subtitle, createdAt, validUntil, ...poll }: PollWithDetails,
    userId?: string | null
  ) {
    return {
      id,
      title,
      subtitle,
      createdAt,
      validUntil,
      options: poll.options.map((option) => ({
        ...option,
        votes: poll.answers.reduce(
          (aggr, answer) => (answer.answer.id === option.id ? ++aggr : aggr),
          0
        ),
      })),
      active: !!validUntil && validUntil > new Date(),
      userVote:
        poll.answers.find((a) => a.userId === userId)?.answer.id ?? null,
      totalVotes: poll.answers.length,
    };
  }
}
