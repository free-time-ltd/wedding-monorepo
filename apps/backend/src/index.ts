import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { generateId } from "@repo/utils/generateId";
import { defineSocketServer } from "./socket";
import { Server } from "@repo/socket";
import { setSocketInstance } from "./socket-instance";
import eventData from "@repo/utils/eventData";
import { env } from "./env";
import weatherRouter from "./routes/weather";
import roomsRouter from "./routes/rooms";
import imageRouter from "./routes/images";
import rsvpRouter from "./routes/rsvp";
import authRouter from "./routes/auth";
import restRouter from "./routes/restful";
import handler from "./handler";
import galleryRouter from "./routes/gallery";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.FRONTEND_URL ?? "*",
    credentials: true,
  })
);

app.onError(handler);

app.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      eTag: generateId(),
      version: "1.0",
      ...eventData,
    },
  });
});

app.route("/api", authRouter);
app.route("/api/rsvps", rsvpRouter);
app.route("/api/rooms", roomsRouter);
app.route("/api/weather", weatherRouter);
app.route("/api/images", imageRouter);
app.route("/api/gallery", galleryRouter);
app.route("/", restRouter);

const server = serve(
  {
    fetch: app.fetch,
    port: Number(env.BACKEND_PORT! ?? 8080),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

const io = new Server(server, {
  path: "/ws",
  serveClient: false,
  cors: { origin: env.FRONTEND_URL, credentials: true },
});

defineSocketServer(io);

setSocketInstance(io);

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
