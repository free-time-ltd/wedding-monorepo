import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { verify, sign } from "hono/jwt";
import { cors } from "hono/cors";
import { db } from "@repo/db/client";
import { eq, sql } from "@repo/db";
import { generateId } from "@repo/utils/generateId";
import { findUser, transformUser } from "@repo/db/utils";
import { defineSocketServer } from "./socket";
import { Server } from "@repo/socket";
import {
  guestUploadsTable,
  invitationTable,
  menuTypes,
  transportTypes,
} from "@repo/db/schema";
import Cache from "@repo/db/cache";
import eventData from "@repo/utils/eventData";
import z from "zod";
import { fetchOpenMeteoWeather } from "./weather";
import { Resend } from "resend";
import { generatePresignedUploadUrl } from "./storage";
import { imageUploadSchema } from "./types";
import { getUserId, isValidWebhookRequest } from "./utils";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
    credentials: true,
  })
);

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
  const users = await db.query.usersTable.findMany({
    with: {
      table: true,
    },
  });

  return c.json({
    success: true,
    data: users.map((user) => ({
      ...user,
      table: { ...user.table, label: user.table?.label ?? user.table?.name },
    })),
  });
});

app.get("/api/tables", async (c) => {
  const tables = await db.query.tablesTable.findMany({
    with: {
      guests: {
        columns: {
          id: true,
          name: true,
          extras: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: tables.map((table) => ({
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

app.get("/api/logout", async (c) => {
  deleteCookie(c, process.env.SESSION_COOKIE_NAME ?? "sess_cookie");

  return c.json({ success: true, data: null, message: "ok" });
});

app.get("/api/rsvps/:id", async (c) => {
  const { id } = c.req.param();

  const guest = await db.query.usersTable.findFirst({
    where: (colums, { eq }) => eq(colums.id, id),
    with: {
      table: true,
      invitation: true,
    },
  });

  if (!guest) {
    return c.json({ success: false, error: "404 Not Found" }, { status: 404 });
  }

  if (guest.invitation) {
    await db
      .update(invitationTable)
      .set({
        views: sql`${invitationTable.views} + 1`,
      })
      .where(eq(invitationTable.id, guest.invitation.id));
  }

  return c.json({ success: true, data: guest });
});

const rsvpSchema = z.object({
  menuChoice: z.enum(menuTypes),
  attending: z.boolean(),
  plusOne: z.boolean(),
  accommodation: z.boolean(),
  transportation: z.enum(transportTypes),
  notes: z.string().optional(),
});

type RsvpInput = z.infer<typeof rsvpSchema>;

app.post("/api/rsvps/:id", async (c) => {
  const { id } = c.req.param();

  // Parse the body
  const body = (c.req.header("Content-Type") === "application/json"
    ? await c.req.json()
    : await c.req.parseBody({ all: true, dot: true })) as unknown as RsvpInput;

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    attending,
    plusOne,
    menuChoice,
    transportation,
    accommodation,
    notes,
  } = parsed.data;

  await db
    .insert(invitationTable)
    .values({
      userId: id,
      attending,
      plusOne,
      menuChoice,
      transportation,
      accommodation,
      notes: notes ?? null,
      createdAt: new Date(),
      views: 0,
    })
    .onConflictDoUpdate({
      target: [invitationTable.userId],
      set: {
        attending,
        plusOne,
        menuChoice,
        transportation,
        accommodation,
        notes: notes ?? null,
      },
    });

  const user = await db.query.usersTable.findFirst({
    where: (columns, { eq }) => eq(columns.id, id),
  });

  if (user) {
    const resend = new Resend(process.env.RESEND_KEY);

    const { error } = await resend.emails.send({
      from: `Wedding <${process.env.MAIL_ADDRESS_FROM}>`,
      to: ["ltsochev@live.com", "krisi.v.kostova@gmail.com"],
      subject: `RSVP Change for: ${user.name}`,
      html: `${user.name} changed their RSVP status. Details below:`,
    });

    if (error) {
      console.error(error);
    }
  }

  return c.json({ success: true, message: "ok" });
});

app.get("/api/rooms/:id", async (c) => {
  const { id } = c.req.param();

  const roomRes = await db.query.roomsTable.findFirst({
    where: (rooms, { eq }) => eq(rooms.id, id),
    with: {
      userRooms: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              extras: true,
            },
            with: {
              table: true,
            },
          },
        },
      },
    },
  });

  if (!roomRes) {
    return c.json({ success: false, error: "room not found" }, { status: 404 });
  }

  if (roomRes.isPrivate) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const cookie = getCookie(c, process.env?.SESSION_COOKIE_NAME!);

    if (!cookie) {
      return c.json({ success: false, error: "No session cookie" });
    }

    const jwtData = await verify(cookie, process.env.JWT_SECRET);
    const roomUsers = roomRes.userRooms.map((userRoom) => userRoom.userId);

    if (!roomUsers.includes(jwtData.sub as string)) {
      return c.json(
        { status: false, error: "You don't have access to this room." },
        { status: 403 }
      );
    }
  }

  const guests = roomRes.isPrivate
    ? roomRes.userRooms.map((userRoom) => ({
        ...userRoom.user,
        table: {
          ...userRoom.user?.table,
          label: userRoom.user?.table?.label ?? userRoom.user?.table?.name,
        },
      }))
    : (await db.query.usersTable.findMany({ with: { table: true } })).map(
        (user) => ({
          ...user,
          table: {
            ...user.table,
            label: user.table?.label ?? user.table?.name,
          },
          joinedAt: new Date(),
        })
      );

  const transformedRoom = {
    id: roomRes.id,
    name: roomRes.name,
    isPrivate: roomRes.isPrivate,
    guests,
  };

  return c.json({ success: true, data: transformedRoom });
});

app.get("/api/weather", async (c) => {
  const cache = new Cache(db, 1000);
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const weddingDate = new Date("2026-06-27");
  const daysUntilWedding = Math.floor(
    (weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const baseDate = daysUntilWedding > 14 ? new Date("2025-06-27") : weddingDate;
  const startDate = new Date(baseDate);
  startDate.setDate(baseDate.getDate() - 4);

  const isHistorical = daysUntilWedding > 14;

  const weatherReport = await cache.remember(
    `weather-${date}`,
    60 * 60 * 24 * 1000,
    async () => {
      const report = await fetchOpenMeteoWeather(
        startDate.toISOString().split("T")[0],
        baseDate.toISOString().split("T")[0],
        [...eventData.location.gps],
        isHistorical
      );

      return report;
    }
  );

  return c.json({
    status: true,
    data: weatherReport,
    daysUntilWedding,
    isHistorical,
    year: baseDate.getFullYear(),
  });
});

app.post("/api/images/upload", async (c) => {
  const body = await c.req.json();
  const userId = await getUserId(c);
  if (!userId) {
    return c.json(
      { success: false, error: "Unauthenticated request." },
      { status: 403 }
    );
  }

  const result = imageUploadSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      {
        status: false,
        error: z.treeifyError(result.error),
      },
      400
    );
  }

  const { message, width, height, sizeBytes, mimeType } = result.data;

  const res = await db
    .insert(guestUploadsTable)
    .values({
      userId,
      s3Key: generateId(),
      message: message,
      createdAt: new Date(),
      status: "pending",
      width,
      height,
      sizeBytes,
      mimeType,
    })
    .returning();

  const guestUpload = res.at(0);

  if (!guestUpload) {
    return c.json(
      { success: false, error: "Something went wrong with upload creation." },
      { status: 501 }
    );
  }

  const presignedUrl = await generatePresignedUploadUrl({
    id: guestUpload.id,
    s3key: guestUpload.s3Key,
    filename: result.data.filename,
    mimeType,
  });

  return c.json({ success: true, data: presignedUrl });
});

app.post("/api/images/process", async (c) => {
  if (!isValidWebhookRequest(c)) {
    return c.json({ status: false, error: "Unauthorized" }, { status: 401 });
  }

  const { originalKey } = await c.req.json();

  if (!originalKey) {
    return c.json({ status: false, error: "Not found" }, { status: 404 });
  }

  const res = await db.query.guestUploadsTable.findFirst({
    where: (columns, { eq }) => eq(columns.s3Key, originalKey),
  });

  if (!res) {
    return c.json(
      { status: false, error: "Not found by S3 Key" },
      { status: 404 }
    );
  }

  await db
    .update(guestUploadsTable)
    .set({
      status: "processed",
      approvedAt: new Date(),
    })
    .where(eq(guestUploadsTable.id, res.id));

  return c.json(
    {
      status: false,
      error: "Not implemented yet",
    },
    { status: 501 }
  );
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
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
});

defineSocketServer(io);

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
