"use server";

import type { UserApiType } from "@repo/db/utils";
import { cookies } from "next/headers";
import { PollsResponse } from "./data";

export const fetchUser = async (): Promise<UserApiType | null> => {
  try {
    const cookieStore = await cookies();
    const url = new URL("/api/me", process.env.NEXT_PUBLIC_API_BASE_URL);
    const res = await fetch(url, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-cache",
      next: { tags: ["current-user"] },
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

export const fetchPollsServer = async () => {
  try {
    const cookieStore = await cookies();
    const url = new URL("/api/polls", process.env.NEXT_PUBLIC_API_BASE_URL);
    const res = await fetch(url, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-cache",
      next: { tags: ["polls"] },
    });

    const json = (await res.json()) as PollsResponse;

    if (json.success) {
      return json.data;
    }

    return {
      polls: [],
      totalVotes: 0,
      userVotes: 0,
    };
  } catch (e) {
    console.error(e);
  }
};
