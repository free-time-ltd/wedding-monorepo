import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

export async function getUserId(c: Context) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const cookie = getCookie(c, process.env?.SESSION_COOKIE_NAME!);
  if (!cookie) return null;

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const data = await verify(cookie, process.env?.JWT_SECRET!);

  if (!("sub" in data)) {
    return null;
  }

  return data.sub as string;
}

export function isValidWebhookRequest(c: Context) {
  const authHeader = c.req.header("Authorization");
  const expectedSecret = `Bearer ${process.env.WEBHOOK_SECRET}`;

  return authHeader && authHeader === expectedSecret;
}
