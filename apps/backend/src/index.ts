import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Server } from "socket.io";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(
  "*",
  cors({
    origin: "*",
  })
);

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
