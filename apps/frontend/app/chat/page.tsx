import { ChatComponent } from "@/components/chat/chat-page";
import { fetchGuests } from "@/lib/data";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "💬 Сватбен чат – Сподели радостта с Кристина и Лъчезар",
  description:
    "Пиши, смей се и споделяй в сватбения чат на Кристина и Лъчезар! Бъди част от енергията, вълнението и любовта на 07.07.2026 в Collibri Beach Bar.",
};

export const dynamic = "force-dynamic";

const fetchUser = async () => {
  try {
    const cookieStore = await cookies();
    const url = new URL("/api/me", process.env.NEXT_PUBLIC_API_BASE_URL);
    const res = await fetch(url, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-cache",
    });
    const json = await res.json();
    if (json.success && "data" in json) {
      return json.data;
    }
    return null;
  } catch (e) {
    console.error(e);
  }

  return null;
};

export default async function ChatPage() {
  const user = await fetchUser();
  if (user === null) {
    return redirect("/guest-select");
  }

  const guests = await fetchGuests();

  return <ChatComponent user={user} guests={guests} />;
}
