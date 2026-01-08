import { and, eq, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { messagesTable, userRooms } from "@repo/db/schema";

type Connection = typeof db;

export class ChatMessagesService {
  private db: Connection;

  constructor(conn: Connection) {
    this.db = conn;
  }

  async getUserRoomsWithUnread(userId: string) {
    return db
      .select({
        roomId: userRooms.roomId,
        joinedAt: userRooms.joinedAt,
        lastReadMessageId: userRooms.lastReadMessageId,
        unreadCount: sql<number>`
        COUNT(
          CASE
            WHEN ${messagesTable.id} > COALESCE(${userRooms.lastReadMessageId}, 0)
            THEN 1
          END
        )
      `,
      })
      .from(userRooms)
      .leftJoin(messagesTable, eq(messagesTable.roomId, userRooms.roomId))
      .where(eq(userRooms.userId, userId))
      .groupBy(userRooms.roomId, userRooms.lastReadMessageId);
  }

  async getLatestMessageId(roomId: string) {
    const row = await this.db.query.messagesTable.findFirst({
      where: (table, { eq }) => eq(table.roomId, roomId),
      orderBy: (table, { desc }) => desc(table.id),
    });

    return row?.id ?? null;
  }

  async markRoomAsRead(userId: string, roomId: string, lastMessageId: number) {
    await this.db
      .update(userRooms)
      .set({
        lastReadMessageId: lastMessageId,
      })
      .where(and(eq(userRooms.userId, userId), eq(userRooms.roomId, roomId)));
  }

  async getUnreadCountForRoom(userId: string, roomId: string) {
    const result = await db
      .select({
        unread: sql<number>`
        COUNT(${messagesTable.id})
      `,
      })
      .from(messagesTable)
      .innerJoin(
        userRooms,
        and(
          eq(userRooms.roomId, messagesTable.roomId),
          eq(userRooms.userId, userId)
        )
      )
      .where(
        sql`
        ${messagesTable.roomId} = ${roomId}
        AND ${messagesTable.id} > COALESCE(${userRooms.lastReadMessageId}, 0)
      `
      );

    return result[0]?.unread ?? 0;
  }
}
