import type { Context, Next } from "hono";
import { getUserId } from "./utils";
import { getCookie } from "hono/cookie";

export interface AuthVariables {
  userId: string;
}

export const requireAuth = async (c: Context, next: Next) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  c.set("userId", userId);

  await next();
};

export const requireAdminAuth = async (c: Context, next: Next) => {
  const token = getCookie(c, "cog_token");
  if (!token) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  await next();
};
