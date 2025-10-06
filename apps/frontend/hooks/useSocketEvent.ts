import { useEffect } from "react";
import type { Socket } from "socket.io-client";

export function useSocketEvent<T>(
  socket: Socket | null | undefined,
  event: string,
  handler: (data: T) => void
) {
  useEffect(() => {
    if (!socket || !socket?.connected) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}
