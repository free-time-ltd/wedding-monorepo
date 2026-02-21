import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { env } from "./env";

export async function getUserId(c: Context) {
  const cookie = getCookie(c, env.SESSION_COOKIE_NAME);
  if (!cookie) return null;

  const data = await verify(cookie, env.JWT_SECRET, "HS256");

  if (!("sub" in data)) {
    return null;
  }

  return data.sub as string;
}

export function isValidWebhookRequest(c: Context) {
  const authHeader = c.req.header("Authorization");
  const expectedSecret = `Bearer ${env.WEBHOOK_SECRET}`;

  return authHeader && authHeader === expectedSecret;
}
