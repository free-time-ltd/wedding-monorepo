import { messagesTable, tablesTable } from "@repo/db/schema";
import type { RoomApiType } from "@repo/db/utils";
import { Server as IOServer, type Socket } from "socket.io";

type MessageModel = typeof messagesTable.$inferSelect;
type UnreadMessagesModel = {
  roomId: string | null;
  joinedAt: Date | null;
  lastReadMessageId: number | null;
  unreadCount: number;
};

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
    id: number;
    roomId: string;
    userId: string;
    message: string;
    createdAt: number;
  }) => void;
  "joined-room": (props: { room: RoomApiType }) => void;
  messages: (props: {
    roomId: string;
    messages: MessageModel[];
    hasMore: boolean;
  }) => void;
  "live-feed": () => void;
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
  "change-user": (props: { userId: string }, callback?: () => void) => void;
  ping: (callback?: () => void) => void;
  "get-unreads": (cb?: (roomList: UnreadMessagesModel[]) => void) => void;
}

export interface InterServerEvents {
  ping: (cb?: () => void) => void;
}

interface SocketData {
  user: UserModel;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export class Server extends IOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {}
