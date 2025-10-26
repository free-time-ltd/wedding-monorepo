import { Server } from "@repo/socket";

let io: Server | null = null;

export function setSocketInstance(instance: Server) {
  io = instance;
}

export function getSocketInstance(): Server | null {
  return io;
}