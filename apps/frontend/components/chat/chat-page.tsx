"use client";

import { useSocket } from "@/context/SocketContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Chatroom, Guest, useChatStore } from "@/store/chatStore";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  extras: number;
  rooms: Array<{
    id: string;
    name: string;
    isPrivate: boolean;
    joinedAt: string;
  }>;
  table: {
    id: number;
    name: string;
    label: string;
    guests: Array<{
      id: string;
      name: string;
      extras: number;
      tableId: number;
    }>;
  };
};

interface Props {
  user: User;
  guests: Guest[];
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

export function ChatComponent({ user, guests }: Props) {
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
  const [isLoading, setIsLoading] = useState(false);
  //   const addMessage = useChatStore((state) => state.addMessage);
  //   const markMessagesSeen = useChatStore((state) => state.markMessagesSeen);

  const chatroom = currentChatroom ? chatrooms[currentChatroom] : null;

  // Initialize the websocket
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  useEffect(() => {
    user.rooms.forEach((room) =>
      addChatroom({
        ...room,
        messages: [],
        unseenCount: 0,
        guests: [],
      } satisfies Chatroom)
    );
  }, [addChatroom, user]);

  const handleRoomSelect = async (roomId: string | null) => {
    if (roomId === null) {
      clearCurrentChatroom();
      return;
    }

    try {
      setIsLoading(true);

      const roomData = await fetchRoomById(roomId);

      if (!roomData) {
        return;
      }

      roomData.guests.forEach((guest) =>
        addGuestToChatroom(roomData.id, guest)
      );

      sendGetMessages(roomId, chatrooms[roomId]?.messages?.at(-1)?.id);

      setCurrentChatroom(roomId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p>
        Hello logged in customer: {user.name}. Are we connected?{" "}
        {isConnected ? "connected" : "disconnected"}
      </p>
      <ul className="flex flex-col">
        {Object.entries(chatrooms).map(([, room]) => (
          <li
            key={room.id}
            onClick={() => handleRoomSelect(room.id)}
            aria-disabled={isLoading}
          >
            {room.name}
          </li>
        ))}
      </ul>
      <p>Current chatroom is: {currentChatroom}</p>
      <p>Guests</p>
      <ul className="flex flex-col">
        {chatroom?.guests.map((guest) => (
          <li key={guest.id}>{guest.name}</li>
        ))}
      </ul>
      <p>Total guests on the wedding: {guests.length}</p>
    </>
  );
}
