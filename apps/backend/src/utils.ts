import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { env } from "./env";

export async function getUserId(c: Context) {
  const cookie = getCookie(c, env.SESSION_COOKIE_NAME!);
  if (!cookie) return null;

  const data = await verify(cookie, env.JWT_SECRET!);

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

export const getRootDomain = (host?: string): string | undefined => {
  if (!host) return undefined;

  try {
    const parts = new URL(`https://${host}`).hostname.split(".");
    return parts.length >= 2 ? parts.slice(-2).join(".") : undefined;
  } catch {
    return undefined;
  }
};
