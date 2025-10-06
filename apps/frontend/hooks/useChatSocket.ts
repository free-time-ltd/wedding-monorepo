import { useChatStore } from "@/store/chatStore";
import { useCallback, useEffect } from "react";
import type { TypedClientSocket, ServerToClientEvents } from "@repo/socket";

export function useChatSocket(socket: TypedClientSocket | undefined | null) {
  const addMessage = useChatStore((state) => state.addMessage);

  const sendGetMessages = useCallback(
    (roomId: string, lastMessageId?: number) => {
      socket?.emit("get-messages", {
        roomId,
        lastMessageId,
      });
    },
    [socket]
  );

  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handleIncomingMessages: ServerToClientEvents["messages"] = ({
      roomId,
      messages,
      hasMore,
    }) => {
      messages.forEach((message) =>
        addMessage(roomId, {
          ...message,
          seen: false,
          createdAt: new Date(message.createdAt).getTime(),
        })
      );

      if (hasMore) {
        sendGetMessages(roomId);
      }
    };

    socket.on("messages", handleIncomingMessages);

    return () => {
      socket.off("messages", handleIncomingMessages);
    };
  }, [socket, addMessage, sendGetMessages]);

  return { sendGetMessages };
}
