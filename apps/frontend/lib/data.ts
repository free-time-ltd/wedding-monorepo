import { Guest } from "@/store/chatStore";
import { cache } from "react";

export const fetchGuests = cache(async (): Promise<Guest[] | null> => {
  try {
    const url = new URL("/api/users", process.env.NEXT_PUBLIC_API_BASE_URL);
    const res = await fetch(url, { cache: "force-cache" });
    const json = await res.json();
    if (json.success && "data" in json) {
      return json.data as Guest[];
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
});
