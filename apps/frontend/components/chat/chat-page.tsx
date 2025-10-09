"use client";

import { useSocket } from "@/context/SocketContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Chatroom, Guest, useChatStore } from "@/store/chatStore";
import { useCallback, useEffect } from "react";
import { ChatUI, RoomCreationType } from "./chat-ui";
import type { UserApiType } from "@repo/db/utils";
import { useRouter } from "next/navigation";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { OfflineIndicator } from "../offline-indicator";

export interface ChatProps {
  user: UserApiType;
  guests: Guest[];
  initialChatroom?: string;
}

const fetchRoomById = async (
  chatroomId: string,
  signal?: AbortSignal
): Promise<Chatroom | null> => {
  const res = await fetch(`/api/rooms/${chatroomId}`, {
    credentials: "include",
    signal: signal,
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();

  return json.data satisfies Chatroom;
};

export function ChatComponent({ user, guests, initialChatroom }: ChatProps) {
  const router = useRouter();
  const { isConnected, connect, socket } = useSocket();
  const { sendGetMessages, createRoom, sendChatMessage } =
    useChatSocket(socket);
  const chatrooms = useChatStore((state) => state.chatrooms);
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const addChatroom = useChatStore((state) => state.addChatroom);
  const addGuestToChatroom = useChatStore((state) => state.addGuestToChatroom);
  const setCurrentChatroom = useChatStore((state) => state.setCurrentChatroom);
  const setGuests = useChatStore((state) => state.setGuests);
  const clearCurrentChatroom = useChatStore(
    (state) => state.clearCurrentChatroom
  );

  // Initialize the websocket
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  // Set the guest list in the store
  useEffect(() => {
    setGuests(guests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests]);

  useEffect(() => {
    user.rooms.forEach((room) => {
      const currentRoom = chatrooms[room.id] ?? null;
      if (!currentRoom) {
        addChatroom({
          ...room,
          guests: [],
          messages: new Set(),
          lastMessage: null,
        } satisfies Chatroom);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRoomSelect = useCallback(
    async (roomId: string | null) => {
      if (roomId === null) {
        clearCurrentChatroom();
        router.push("/chat");
        return;
      }

      if (roomId === currentChatroom) {
        return;
      }

      try {
        const roomData = await fetchRoomById(roomId);

        if (!roomData) {
          return;
        }

        roomData.guests.forEach((guest) =>
          addGuestToChatroom(roomData.id, guest)
        );

        sendGetMessages(roomId, chatrooms[roomId]?.lastMessage?.id);

        setCurrentChatroom(roomId);
        router.push(`/chat/${roomId}`);
      } catch (e) {
        console.error(e);
      }
    },
    [
      currentChatroom,
      clearCurrentChatroom,
      router,
      sendGetMessages,
      chatrooms,
      setCurrentChatroom,
      addGuestToChatroom,
    ]
  );

  const handleMessageSend = (message: string) => {
    sendChatMessage({
      roomId: currentChatroom ?? "lobby",
      message,
    });
  };

  // Auto-join room
  useEffect(() => {
    if (!initialChatroom || currentChatroom === initialChatroom) return;

    if (initialChatroom in chatrooms && currentChatroom === null) {
      handleRoomSelect(initialChatroom);
    }
  }, [
    initialChatroom,
    chatrooms,
    currentChatroom,
    setCurrentChatroom,
    handleRoomSelect,
  ]);

  const handleRoomCreation = ({ name, invitedUserIds }: RoomCreationType) => {
    createRoom({
      roomName: name,
      invitedUserIds,
    });
  };

  return (
    <>
      <ChatUI
        user={user}
        guests={guests}
        onRoomChange={handleRoomSelect}
        onRoomCreate={handleRoomCreation}
        onMessageSend={handleMessageSend}
      />
      <Toaster />
      <OfflineIndicator />
    </>
  );
}
