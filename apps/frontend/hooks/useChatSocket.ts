import { Chatroom, useChatStore } from "@/store/chatStore";
import { useCallback, useEffect } from "react";
import type { ServerToClientEvents } from "@repo/socket";
import type { TypedClientSocket } from "@repo/socket/client";
import { useRouter } from "next/navigation";
import { toast } from "@repo/ui";

export function useChatSocket(socket: TypedClientSocket | undefined | null) {
  const router = useRouter();
  const addMessage = useChatStore((state) => state.addMessage);
  const addChatroom = useChatStore((state) => state.addChatroom);
  const { setUnreadMessages, getChatroom } = useChatStore();

  const sendGetMessages = useCallback(
    (roomId: string, lastMessageId?: number) => {
      socket?.emit("get-messages", {
        roomId,
        lastMessageId,
      });
    },
    [socket]
  );

  const createRoom = useCallback(
    ({
      roomName,
      invitedUserIds,
    }: {
      roomName: string;
      invitedUserIds: string[];
    }) => {
      socket?.emit("create-room", { roomName, invitedUserIds });
    },
    [socket]
  );

  const sendChatMessage = useCallback(
    ({ roomId, message }: { roomId: string; message: string }) => {
      socket?.emit("chat-message", {
        message,
        roomId,
      });
    },
    [socket]
  );

  const refetchUnreads = useCallback(() => {
    socket?.emit("get-unreads", function (unreads) {
      setUnreadMessages(
        Object.fromEntries(
          unreads.map((record) => [record.roomId, record.unreadCount])
        )
      );
    });
  }, [setUnreadMessages, socket]);

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
          userId: message.userId!,
          createdAt: new Date(message.createdAt).getTime(),
        })
      );

      if (hasMore) {
        sendGetMessages(
          roomId,
          getChatroom(roomId)?.lastMessage?.id ?? undefined
        );
      }
    };

    const handleNewRoom: ServerToClientEvents["new-room"] = ({ room }) => {
      router.push(`/chat/${encodeURIComponent(room)}?source=from-hook`);
      toast.success("Стаята бе създадена успешно!");
    };

    const handleNewChatMessage: ServerToClientEvents["chat-message"] = (
      message
    ) => {
      addMessage(message.roomId, {
        ...message,
        content: message.message,
      });
    };

    const handleRoomJoin: ServerToClientEvents["joined-room"] = ({ room }) => {
      addChatroom(room as Chatroom);
    };

    socket.on("messages", handleIncomingMessages);
    socket.on("new-room", handleNewRoom);
    socket.on("chat-message", handleNewChatMessage);
    socket.on("joined-room", handleRoomJoin);

    return () => {
      socket.off("messages", handleIncomingMessages);
      socket.off("new-room", handleNewRoom);
      socket.off("chat-message", handleNewChatMessage);
      socket.off("joined-room", handleRoomJoin);
    };
  }, [socket, addMessage, sendGetMessages, router, addChatroom, getChatroom]);

  return { sendGetMessages, refetchUnreads, createRoom, sendChatMessage };
}
