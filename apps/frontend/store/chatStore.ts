import { create } from "zustand";

export interface Guest {
  id: string;
  name: string;
  tableId: number;
  table: {
    id: number;
    name: string;
    label: string;
  };
}

export interface Message {
  id: number;
  roomId: string;
  content: string;
  createdAt: number;
  userId: string | null;
}

export interface Chatroom {
  id: string;
  name: string;
  guests: Guest[];
  isPrivate: boolean;
  messages: Set<Message>;
  lastMessage: Message | null;
}

export interface ChatStore {
  chatrooms: Record<string, Chatroom>;
  guests: Guest[];
  addChatroom: (chatroom: Chatroom) => void;
  addMessage: (chatroomId: string, message: Message) => void;
  addGuestToChatroom: (chatroomId: string, guest: Guest) => void;
  removeGuest: (chatroomId: string, guestId: string) => void;
  setGuests: (guestList: Guest[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  guests: [],
  chatrooms: {
    lobby: {
      id: "lobby",
      guests: [],
      isPrivate: false,
      messages: new Set(),
      name: "Lobby",
      lastMessage: null,
    },
  },
  addChatroom: (chatroom) =>
    set((state) => ({
      chatrooms: { ...state.chatrooms, [chatroom.id]: chatroom },
    })),
  addMessage: (chatroomId, message) =>
    set((state) => {
      const chatroom = state.chatrooms[chatroomId];
      if (!chatroom) return state;

      const updatedMessages = [...Array.from(chatroom.messages), message];

      if (message.createdAt < (updatedMessages.at(-1)?.createdAt ?? 0)) {
        const index = updatedMessages.findIndex(
          (m) => m.createdAt > message.createdAt
        );
        updatedMessages.splice(index, 0, message);
      } else {
        updatedMessages.push(message);
      }

      // We only need to store the last 100 messages
      if (updatedMessages.length > 100) updatedMessages.shift();

      return {
        chatrooms: {
          ...state.chatrooms,
          [chatroomId]: {
            ...chatroom,
            messages: new Set(updatedMessages),
            lastMessage: message,
          },
        },
      };
    }),
  addGuestToChatroom: (chatroomId, guest) =>
    set((state) => {
      const chatroom = state.chatrooms[chatroomId];
      if (
        !chatroom ||
        chatroom.guests.find((roomGuest) => roomGuest.id === guest.id)
      )
        return state;

      return {
        chatrooms: {
          ...state.chatrooms,
          [chatroomId]: { ...chatroom, guests: [...chatroom.guests, guest] },
        },
      };
    }),
  removeGuest: (chatroomId, guestId) =>
    set((state) => {
      const chatroom = state.chatrooms[chatroomId];
      if (!chatroom) {
        return state;
      }
      return {
        chatrooms: {
          ...state.chatrooms,
          [chatroomId]: {
            ...chatroom,
            guests: chatroom.guests.filter((guest) => guest.id !== guestId),
          },
        },
      };
    }),
  setGuests: (guests) =>
    set(() => ({
      guests,
    })),
}));
