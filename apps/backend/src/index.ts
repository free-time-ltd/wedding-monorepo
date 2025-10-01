import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { cors } from "hono/cors";
import { Server } from "socket.io";
import { db } from "@repo/db/client";
import { usersTable } from "@repo/db/schema";
import { eq } from "@repo/db";
import { generateId } from "@repo/utils/generateId";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.get("/", (c) => {
  return c.text(`Hello Hono! ${generateId()}`);
});

app.get("/api/me", async (c) => {
  const cookie = getCookie(c, process.env?.SESSION_COOKIE_NAME!);
  if (!cookie) {
    return c.json({ success: false, error: "No session cookie" });
  }

  const data = await verify(cookie, process.env?.JWT_SECRET!);

  console.log({ data });

  return c.json({ success: true, data });
});

app.post("/api/user/set", async (c) => {
  const body = await c.req.json();

  // Step 1. Try to find the user in the sqlite table
  const user = body.user;
  if (!user) {
    return c.json(
      { success: false, error: "No user provided" },
      { status: 400 }
    );
  }

  const res = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user))
    .get();

  console.log({ res });

  // Step 2. Load table data, chat rooms, messages etc...

  // Step 3. Generate JWT token containing all this

  // Step 4. Generate a cookie

  // Step 5. Respond

  return c.json({ success: true, message: "User created", data: body }, 201);
});

const server = serve(
  {
    fetch: app.fetch,
    port: 8080,
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
