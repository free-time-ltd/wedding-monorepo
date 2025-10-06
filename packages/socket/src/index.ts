import { roomsTable, messagesTable, tablesTable } from "@repo/db/schema";
import { Server as IOServer, type Socket } from "socket.io";
import type { Socket as ClientSocket } from "socket.io-client";

type RoomModel = typeof roomsTable.$inferSelect;
type MessageModel = typeof messagesTable.$inferSelect;

export type UserModel = {
  id: string;
  name: string;
  extras: number;
  table: typeof tablesTable.$inferSelect;
  rooms: Array<{
    id: string;
    name: string;
    isPrivate: boolean;
    joinedAt: string;
  }>;
};

export interface ServerToClientEvents {
  "new-room": (props: { room: string }) => void;
  "chat-message": (props: {
    roomId: string;
    userId: string;
    message: string;
    createdAt: number;
  }) => void;
  "joined-room": (props: { room: RoomModel }) => void;
  messages: (props: {
    roomId: string;
    messages: MessageModel[];
    hasMore: boolean;
  }) => void;
}

export interface ClientToServerEvents {
  "create-room": (props: {
    roomName: string;
    invitedUserIds: string[];
  }) => void;
  "join-room": (props: { roomId: string }) => void;
  "get-messages": (props: { roomId: string; lastMessageId?: number }) => void;
  "chat-message": (props: { roomId: string; message: string }) => void;
  "invite-room": (props: { roomId: string; userId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  user: UserModel;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type TypedClientSocket = ClientSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export class Server extends IOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {}
