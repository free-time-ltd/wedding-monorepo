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
  id: string;
  roomId: string;
  content: string;
  createdAt: number;
  seen: boolean;
}

export interface Chatroom {
  id: string;
  name: string;
  guests: Guest[];
  isPrivate: boolean;
  unseenCount: number;
  messages: Message[];
}

export interface ChatStore {
  chatrooms: Record<string, Chatroom>;
  currentChatroom: string | null;
  addChatroom: (chatroom: Chatroom) => void;
  addMessage: (chatroomId: string, message: Message) => void;
  markMessagesSeen: (chatroomId: string) => void;
  addGuestToChatroom: (chatroomId: string, guest: Guest) => void;
  setCurrentChatroom: (chatroomId: string) => void;
  clearCurrentChatroom: () => void;
  removeGuest: (chatroomId: string, guestId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatrooms: {},
  currentChatroom: null,
  addChatroom: (chatroom) =>
    set((state) => ({
      chatrooms: { ...state.chatrooms, [chatroom.id]: chatroom },
    })),
  addMessage: (chatroomId, message) =>
    set((state) => {
      const chatroom = state.chatrooms[chatroomId];
      if (!chatroom) return state;

      const updatedMessages = [...chatroom.messages, message];
      const unseenCount = message.seen
        ? chatroom.unseenCount
        : chatroom.unseenCount + 1;

      return {
        chatrooms: {
          ...state.chatrooms,
          [chatroomId]: { ...chatroom, messages: updatedMessages, unseenCount },
        },
      };
    }),
  markMessagesSeen: (chatroomId) =>
    set((state) => {
      const chatroom = state.chatrooms[chatroomId];
      if (!chatroom) return state;

      const updatedMessages = chatroom.messages.map((msg) => ({
        ...msg,
        seen: true,
      }));

      return {
        chatrooms: {
          ...state.chatrooms,
          [chatroomId]: {
            ...chatroom,
            messages: updatedMessages,
            unseenCount: 0,
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
  setCurrentChatroom: (chatroomId) =>
    set(() => ({
      currentChatroom: chatroomId,
    })),
  clearCurrentChatroom: () => set(() => ({ currentChatroom: null })),
  removeGuest: (chatroomId, guestId) =>
    set((state) => ({
      chatrooms: {
        ...state.chatrooms,
      },
    })),
}));
