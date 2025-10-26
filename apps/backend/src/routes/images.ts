import { requireAuth } from "@/middleware";
import { generatePresignedUploadUrl } from "@/storage";
import { imageUploadSchema, SimpleAuthContext } from "@/types";
import { isValidWebhookRequest } from "@/utils";
import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import { guestUploadsTable } from "@repo/db/schema";
import { generateId } from "@repo/utils/generateId";
import { Hono } from "hono";
import { z } from "zod";
import { getSocketInstance } from "@/socket-instance";

const imageRouter = new Hono();

imageRouter.post("/upload", requireAuth, async (c: SimpleAuthContext) => {
  const body = await c.req.json();
  const userId = c.get("userId");

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

  const { filename, message, width, height, sizeBytes, mimeType } = result.data;

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
      origFilename: filename,
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

imageRouter.post("/process", async (c) => {
  if (!isValidWebhookRequest(c)) {
    return c.json({ status: false, error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { originalKey },
  } = await c.req.json();

  if (!originalKey) {
    return c.json({ status: false, error: "Not found" }, { status: 404 });
  }

  const res = await db.query.guestUploadsTable.findFirst({
    where: (columns, { eq }) => eq(columns.s3Key, originalKey),
  });

  if (!res) {
    return c.json(
      {
        status: false,
        error: `Not found by S3 Key. The key used: "${originalKey}"`,
      },
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

  const io = getSocketInstance();
  if (io) {
    io.emit("live-feed");
  }

  return c.json({
    success: true,
    data: "ok",
  });
});

export default imageRouter;
