"use client";

import { fetchGuestbook, GuestbookEntry } from "@/lib/data";
import { GuestbookMessage } from "./message";
import { useState } from "react";

interface Props {
  currentUserId?: string;
  initialMessages: GuestbookEntry[];
}

export function MessageList({ currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<GuestbookEntry[]>(
    () => initialMessages
  );

  const fetchMessages = () => {
    fetchGuestbook().then((res) => setMessages(res));
  };

  const handleLikeClick = async (id: number) => {
    const res = await fetch(
      new URL(
        `/api/guestbook/${id}/like`,
        process.env.NEXT_PUBLIC_API_BASE_URL
      ),
      {
        credentials: "include",
        method: "post",
      }
    );

    const json = await res.json();

    if (json.success) {
      fetchMessages();
    }
  };

  return (
    <div className="columns-1 md:columns-2 gap-6">
      {messages.map((entry) => (
        <div className="break-inside-avoid mb-6" key={entry.id}>
          <GuestbookMessage
            message={entry}
            onClick={handleLikeClick}
            liked={!!currentUserId && entry.likes.includes(currentUserId)}
          />
        </div>
      ))}
    </div>
  );
}
