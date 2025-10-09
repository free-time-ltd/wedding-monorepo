import { ClientToServerEvents, ServerToClientEvents } from ".";
import { Socket } from "socket.io-client";
export type { Socket, SocketOptions } from "socket.io-client";
export { io } from "socket.io-client";

export type TypedClientSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
