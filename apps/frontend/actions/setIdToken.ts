"use server";

import { cookies } from "next/headers";

export async function setIdToken(token: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "cog_token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60,
    sameSite: "strict",
  });
}
