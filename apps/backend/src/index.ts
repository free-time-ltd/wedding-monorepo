import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { verify, sign } from "hono/jwt";
import { cors } from "hono/cors";
import { Server } from "socket.io";
import { db } from "@repo/db/client";
import { tablesTable, usersTable } from "@repo/db/schema";
import { generateId } from "@repo/utils/generateId";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      eTag: generateId(),
      version: "1.0",
      eventName: "Lacho & Krisi's Wedding",
      date: "2026-07-07",
      time: "19:00",
      tz: "Europe/Sofia",
      location: {
        city: "Plovdiv, Bulgaria",
        venue: "Collibri Pool Plovdiv",
        address: "86, 4015 Plovdiv",
        gps: [42.1142642, 24.6800456],
        plus: "4M7J+P2 Plovdiv",
      },
      contactEmails: ["ltsochev@live.com", "krisi.v.kostova@gmail.com"],
      contactPhone: "+3590897498226",
      website: "https://krisilacho.com",
      dressCode: "Formal",
      parking: "Available at venue",
      notes: "Please arrive 15 minutes early",
      links: {
        guests: "/api/users",
        tables: "/api/tables",
      },
    },
  });
});

app.get("/api/me", async (c) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const cookie = getCookie(c, process.env?.SESSION_COOKIE_NAME!);
  if (!cookie) {
    return c.json({ success: false, error: "No session cookie" });
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const data = await verify(cookie, process.env?.JWT_SECRET!);

  if (!("sub" in data)) {
    return c.json({ success: false, error: "user not found" }, { status: 404 });
  }

  const userModel = await findUser(data.sub as string);
  if (!userModel) {
    return c.json({ success: false, error: "user not found" }, { status: 404 });
  }

  return c.json({ success: true, data: transformUser(userModel) });
});

app.get("/api/users", async (c) => {
  const users = await db.select().from(usersTable);

  return c.json({ users });
});

app.get("/api/tables", async (c) => {
  const tables = await db.select().from(tablesTable);

  return c.json({
    tables: tables.map((table) => ({
      ...table,
      label: table.label ?? table.name,
    })),
  });
});

app.post("/api/user/set", async (c) => {
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

    const jwtToken = await sign(payload, process.env.JWT_SECRET, "HS256");

    setCookie(c, process.env.SESSION_COOKIE_NAME ?? "sess_cookie", jwtToken, {
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

const server = serve(
  {
    fetch: app.fetch,
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    port: Number(process.env?.BACKEND_PORT! ?? 8080),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

const io = new Server(server, {
  path: "/ws",
  serveClient: false,
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🔨 incoming connection from: ", socket.id);

  socket.on("disconnect", (reason) => {
    console.log(`socket disconnected: ${socket.id} for ${reason}`);
  });
});

const findUser = (userId: string) => {
  return db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      table: {
        with: {
          guests: true,
        },
      },
      userRooms: {
        columns: {
          roomId: true,
          joinedAt: true,
        },
        with: {
          room: true,
        },
      },
    },
  });
};

const transformUser = (
  user: NonNullable<Awaited<ReturnType<typeof findUser>>>
) => {
  return {
    id: user.id,
    name: user.name,
    extras: user.extras,
    table: { ...user.table, label: user.table?.label ?? user.table?.name },
    rooms: user.userRooms.map((userRoom) => ({
      id: userRoom.roomId,
      name: userRoom.room?.name,
      isPrivate: userRoom.room?.isPrivate,
      joinedAt: userRoom.joinedAt,
    })),
  };
};

// graceful shutdown
process.on("SIGINT", async () => {
  server.close();
  await io.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await io.close();
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
