import { env } from "@/env";
import { requireAuth } from "@/middleware";
import { SimpleAuthContext } from "@/types";
import { findUser, transformUser } from "@repo/db/utils";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

const authRouter = new Hono();

authRouter.get("/me", requireAuth, async (c: SimpleAuthContext) => {
  const userId = c.get("userId");

  const userModel = await findUser(userId);
  if (!userModel) {
    return c.json({ success: false, error: "user not found" }, { status: 404 });
  }

  return c.json({ success: true, data: transformUser(userModel) });
});

authRouter.post("/user/set", async (c) => {
  try {
    const body = await c.req.json();

    const user = body.user;
    if (!user) {
      return c.json(
        { success: false, error: "No user provided" },
        { status: 400 }
      );
    }

    const userModel = await findUser(user);

    if (!userModel) {
      return c.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const payload = {
      sub: userModel.id,
      name: userModel.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      iss: "lachokrisi-wedding",
    };

    const jwtToken = await sign(payload, env.JWT_SECRET, "HS256");

    setCookie(c, env.SESSION_COOKIE_NAME ?? "sess_cookie", jwtToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return c.json({ success: true, data: userModel }, 201);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return c.json({ success: false, error: e.message }, { status: 500 });
    }

    if (typeof e === "object" && e !== null && "message" in e) {
      return c.json(
        { success: false, error: String(e.message) },
        { status: 500 }
      );
    }

    return c.json({ success: false, error: "Unknown error" }, { status: 500 });
  }
});

authRouter.get("/logout", async (c) => {
  deleteCookie(c, env.SESSION_COOKIE_NAME ?? "sess_cookie");

  return c.json({ success: true, data: null, message: "ok" });
});

export default authRouter;
