import type { ExtendedError, Socket } from "socket.io";
import * as cookie from "cookie";
import { verify } from "hono/jwt";
import { findUser, transformUser } from "@repo/db/utils";
import { env } from "./env";

const sessionName = env.SESSION_COOKIE_NAME ?? "sess";

export async function authorizedSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const parsed = cookie.parse(socket.request.headers.cookie ?? "");
  const jwtCookie = parsed[sessionName];
  if (!jwtCookie) {
    return next(
      new Error(
        "No session cookie provided in the initial connection request.",
        { cause: socket.request }
      )
    );
  }

  try {
    const jwtData = await verify(jwtCookie, env.JWT_SECRET);
    const userModel = await findUser(jwtData.sub as string);
    if (!userModel) {
      return next(new Error("User not found"));
    }

    const transformedUser = transformUser(userModel);

    socket.data.user = transformedUser;

    transformedUser.rooms.forEach((room) => {
      if (room) {
        socket.join(room.id as string);
      }
    });

    next();
  } catch (e) {
    next(e as Error);
  }
}
