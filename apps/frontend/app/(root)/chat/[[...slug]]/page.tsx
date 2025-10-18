import { ChatPage } from "@/components/chat/chat-page";
import { fetchGuests } from "@/lib/data";
import { UserApiType } from "@repo/db/utils";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { use } from "react";

export const metadata: Metadata = {
  title: "💬 Сватбен чат – Сподели радостта с Кристина и Лъчезар",
  description:
    "Пиши, смей се и споделяй в сватбения чат на Кристина и Лъчезар! Бъди част от енергията, вълнението и любовта на 07.07.2026 в Collibri Beach Bar.",
};

export const dynamic = "force-dynamic";

const fetchUser = async (): Promise<UserApiType | null> => {
  try {
    const cookieStore = await cookies();
    const url = new URL("/api/me", process.env.NEXT_PUBLIC_API_BASE_URL);
    const res = await fetch(url, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-cache",
    });
    const json = await res.json();
    if (json.success && "data" in json) {
      return json.data as UserApiType;
    }
    return null;
  } catch (e) {
    console.error(e);
  }

  return null;
};

export default function ChatPageServer({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const user = use(fetchUser());
  const guests = use(fetchGuests()) || [];

  if (!user) {
    return redirect("/guest-select");
  }

  const chatroom = slug?.at(0);

  const roomExists = user.rooms.findIndex((room) => room?.id === chatroom) > -1;

  if (slug && chatroom !== "lobby" && !roomExists) {
    notFound();
  }

  return <ChatPage user={user} guests={guests} initialChatroom={chatroom} />;
}
