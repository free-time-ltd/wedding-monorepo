"use server";

import { getRootDomain } from "@repo/utils/getRootDomain";
import { cookies, headers } from "next/headers";

export async function setIdToken(token: string) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const host = headerStore.get("host");

  cookieStore.set({
    name: "cog_token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain:
      !!host && process.env.NODE_ENV === "production"
        ? `.${getRootDomain(host)}`
        : undefined,
  });
}
