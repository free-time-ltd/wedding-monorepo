"use client";

import { useSocket } from "@/context/SocketContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Chatroom, Guest, useChatStore } from "@/store/chatStore";
import { useCallback, useEffect, useState } from "react";
import { ChatUI } from "./chat-ui";
import type { UserApiType } from "@repo/db/utils";
import { useRouter } from "next/navigation";

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
  const { sendGetMessages } = useChatSocket(socket);
  const chatrooms = useChatStore((state) => state.chatrooms);
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const addChatroom = useChatStore((state) => state.addChatroom);
  const addGuestToChatroom = useChatStore((state) => state.addGuestToChatroom);
  const setCurrentChatroom = useChatStore((state) => state.setCurrentChatroom);
  const clearCurrentChatroom = useChatStore(
    (state) => state.clearCurrentChatroom
  );

  // Initialize the websocket
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  useEffect(() => {
    user.rooms.forEach((room) => {
      const currentRoom = chatrooms[room.id] ?? null;
      if (!currentRoom) {
        addChatroom({
          ...room,
          guests: [],
          messages: [],
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

        sendGetMessages(roomId, chatrooms[roomId]?.messages?.at(-1)?.id);

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

  return (
    <>
      <ChatUI user={user} guests={guests} onRoomChange={handleRoomSelect} />
    </>
  );
}
