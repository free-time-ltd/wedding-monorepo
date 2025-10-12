"use client";

import { useSocket } from "@/context/SocketContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Chatroom, Guest, useChatStore } from "@/store/chatStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatUI, RoomCreationType } from "./chat-ui";
import type { UserApiType } from "@repo/db/utils";
import { useRouter } from "next/navigation";
import { OfflineIndicator } from "../offline-indicator";
import Link from "next/link";

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

export function ChatPage({ user, guests, initialChatroom }: ChatProps) {
  const router = useRouter();
  const { isConnected, connect, socket } = useSocket();
  const { sendGetMessages, createRoom, sendChatMessage } =
    useChatSocket(socket);
  const chatrooms = useChatStore((state) => state.chatrooms);
  const addChatroom = useChatStore((state) => state.addChatroom);
  const addGuestToChatroom = useChatStore((state) => state.addGuestToChatroom);
  const setGuests = useChatStore((state) => state.setGuests);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const selectedRoom = useMemo(() => {
    return selectedRoomId ? (chatrooms[selectedRoomId] ?? null) : null;
  }, [chatrooms, selectedRoomId]);

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

  const loadRoomData = useCallback(
    async (roomId: string | null) => {
      if (!roomId) return;

      try {
        const roomData = await fetchRoomById(roomId);
        if (!roomData) {
          return;
        }

        roomData.guests.forEach((guest) =>
          addGuestToChatroom(roomData.id, guest)
        );

        sendGetMessages(roomId, chatrooms[roomId]?.lastMessage?.id);
      } catch (e) {
        console.error(e);
      }
    },
    [addGuestToChatroom, chatrooms, sendGetMessages]
  );

  const handleRoomSelect = useCallback(
    async (roomId: string | null) => {
      if (roomId === null) {
        setSelectedRoomId(null);
        router.push("/chat");
        return;
      }

      const chatroom = chatrooms[roomId];

      // Skip if already active or room doesn’t exist
      if (!chatroom || roomId === selectedRoomId) return;

      await loadRoomData(roomId);

      router.replace(`/chat/${roomId}`);
    },
    [chatrooms, selectedRoomId, loadRoomData, router]
  );

  const handleMessageSend = (message: string) => {
    sendChatMessage({
      roomId: selectedRoomId ?? "lobby",
      message,
    });
  };

  const handleRoomCreation = ({ name, invitedUserIds }: RoomCreationType) => {
    createRoom({
      roomName: name,
      invitedUserIds,
    });
  };

  // Autojoin on initial load
  useEffect(() => {
    if (initialChatroom && isConnected) {
      loadRoomData(initialChatroom).then(() => {
        setSelectedRoomId(initialChatroom);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChatroom, isConnected]);

  return (
    <>
      <Link href="/">Go home</Link>
      <ChatUI
        user={user}
        guests={guests}
        selectedRoom={selectedRoom}
        onRoomChange={handleRoomSelect}
        onRoomCreate={handleRoomCreation}
        onMessageSend={handleMessageSend}
      />
      <OfflineIndicator />
    </>
  );
}
