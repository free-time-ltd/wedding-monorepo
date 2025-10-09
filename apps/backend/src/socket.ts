import { generateId } from "@repo/utils/generateId";
import { messagesTable, roomsTable, userRooms } from "@repo/db/schema";
import { db } from "@repo/db/client";
import { authorizedSocket } from "./authorized-socket";
import { Server } from "@repo/socket";

export function defineSocketServer(io: Server) {
  io.use(authorizedSocket);

  io.on("connection", (socket) => {
    console.log("🔨 incoming connection from: ", socket.id);

    if (!socket.data.user) {
      socket.disconnect(true);
    }

    socket.join("lobby");
    socket.join(`user-${socket.data.user.id}`);

    // Join the private rooms
    socket.data.user.rooms.forEach((room) => {
      socket.join(`room-${room.id}`);
    });

    // Define the listeners
    socket.on("disconnect", (reason) => {
      console.log(`socket disconnected: ${socket.id} for ${reason}`);
    });

    socket.on("create-room", async ({ roomName, invitedUserIds = [] }) => {
      const roomId = generateId();
      const insertRows: Array<typeof userRooms.$inferInsert> = Array.from(
        new Set([socket.data.user.id, ...invitedUserIds])
      ).map((userId) => ({
        roomId,
        userId,
        joinedAt: new Date(),
      }));

      await db.insert(roomsTable).values({
        id: roomId,
        name: roomName,
        createdBy: socket.data.user.id,
        createdAt: new Date(),
        isPrivate: true,
      });

      await db.insert(userRooms).values(insertRows);

      // We've prepared the database. Join the user into their new room
      socket.join(`room-${roomId}`);

      invitedUserIds.forEach((uid) => {
        io.to(`user-${uid}`).emit("new-room", {
          room: roomId,
        });
      });
    });

    socket.on("chat-message", async ({ roomId, message }) => {
      // @todo Maybe add a check to see if the user can really add messages to this room?
      const userId = socket.data.user.id as string;

      if (message.trim().length === 0) return;

      const [newMessage] = await db
        .insert(messagesTable)
        .values({
          roomId,
          userId,
          content: message,
          createdAt: new Date(),
        } as typeof messagesTable.$inferInsert)
        .returning({ id: messagesTable.id });

      io.to(`room-${roomId}`).emit("chat-message", {
        id: newMessage.id,
        roomId,
        userId,
        message,
        createdAt: Date.now(),
      });
    });

    socket.on("invite-room", async ({ roomId, userId }) => {
      const room = await db.query.roomsTable.findFirst({
        where: (rooms, { eq }) => eq(rooms.id, roomId),
      });

      if (!room || room.createdBy !== socket.data.user.id) {
        return;
      }

      await db.insert(userRooms).values({
        roomId,
        userId,
        joinedAt: new Date(),
      });

      io.to(`user-${userId}`).emit("new-room", {
        room: roomId,
      });
    });

    socket.on("join-room", async ({ roomId }) => {
      const uid = socket.data.user.id;
      const room = await db.query.roomsTable.findFirst({
        where: (table, { eq }) => eq(table.id, roomId),
      });
      if (!room) return;

      if (!room.isPrivate) {
        socket.join(`room-${roomId}`);
        io.to(`user-${uid}`).emit("joined-room", { room });
        return;
      }

      const userAllowed = await db.query.userRooms.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.roomId, roomId), eq(table.userId, uid)),
      });

      if (!userAllowed) {
        return;
      }

      socket.join(`room-${roomId}`);
      io.to(`user-${uid}`).emit("joined-room", { room });
    });

    socket.on("get-messages", async ({ roomId, lastMessageId = 0 }) => {
      try {
        const fetched = await db.query.messagesTable.findMany({
          where: (table, { gt, eq, and }) =>
            and(eq(table.roomId, roomId), gt(table.id, Number(lastMessageId))),
          orderBy: (table, { asc }) => asc(table.id),
          limit: 101,
        });

        const hasMore = fetched.length > 100;
        const messages = hasMore ? fetched.slice(0, 100) : fetched;

        socket.emit("messages", { roomId, messages, hasMore });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });

    socket.on("ping", (callback) => {
      callback?.();
    });
  });
}
