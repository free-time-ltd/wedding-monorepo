import { db } from "@repo/db/client";
import { invitationTable, usersTable } from "@repo/db/schema";

type Connection = typeof db;

export class RsvpRepository {
  constructor(private db: Connection) {}

  async findById(id: number) {
    return this.db.query.invitationTable.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });
  }

  async findUserByName(name: string) {
    return this.db.query.usersTable.findFirst({
      where: (table, { eq }) => eq(table.name, name),
    });
  }

  async createRsvp(input: typeof invitationTable.$inferInsert) {
    return this.db
      .insert(invitationTable)
      .values(input)
      .onConflictDoUpdate({
        target: [invitationTable.userId],
        set: {
          attending: input.attending,
          plusOne: input.plusOne,
          menuChoice: input.menuChoice,
          transportation: input.transportation,
          accommodation: input.accommodation,
          notes: input.notes ?? null,
        },
      })
      .returning();
  }

  async createUser({
    name,
    ...rest
  }: { name: string } & Partial<typeof usersTable.$inferInsert>) {
    const users = await this.db
      .insert(usersTable)
      .values({
        name,
        ...rest,
      })
      .returning();

    return users.at(0);
  }
}
