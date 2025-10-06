import { Chatroom, useChatStore } from "@/store/chatStore";
import { useCallback, useEffect } from "react";
import type { Socket } from "socket.io-client";

export function useChatSocket(socket: Socket | undefined | null) {
  const addMessage = useChatStore((state) => state.addMessage);

  const sendGetMessages = useCallback(
    (roomId: string, lastMessageId?: string) => {
      socket?.emit("get-messages", {
        roomId,
        lastMessageId,
      });
    },
    [socket]
  );

  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handleIncomingMessages = ({
      roomId,
      messages,
      hasMore,
    }: {
      roomId: string;
      messages: Chatroom["messages"];
      hasMore: boolean;
    }) => {
      // @todo don't ignore the hasMore flag in the future
      messages.forEach((message) => addMessage(roomId, message));

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
