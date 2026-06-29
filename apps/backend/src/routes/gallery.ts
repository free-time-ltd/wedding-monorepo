import { Hono } from "hono";
import { errorResponse, successResponse } from "@/reponses";
import {
  countProcessedImages,
  findImageUploaders,
  findProcessedImages,
  transformProcessedImageWithFullUrl,
} from "@repo/db/utils";
import { env } from "@/env";
import { getUserId } from "@/utils";
import { requireAuth } from "@/middleware";
import { SimpleAuthContext } from "@/types";
import { Resend } from "resend";
import { newsletterSignSchema } from "@/types";
import z from "zod";
import { and, count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import { guestUploadLikesTable, newsletterTable } from "@repo/db/schema";

const galleryRouter = new Hono();

galleryRouter.get("/guests", async (c) => {
  const {
    cursor,
    sort = "desc",
    orderBy,
    uploader,
    limit = 20,
  } = c.req.query();

  const userId = await getUserId(c);

  const images = await findProcessedImages({
    cursor,
    orderBy,
    sort,
    uploader,
    limit: Number(limit),
  });

  const nextCursor =
    images.length === limit ? images[images.length - 1].id : null;

  return successResponse(c, {
    images: images.map(
      transformProcessedImageWithFullUrl(env.CDN_DOMAIN, userId ?? undefined),
    ),
    nextCursor,
  });
});

galleryRouter.get("/uploaders", async (c) => {
  const [uploaders, totalImages] = await Promise.all([
    findImageUploaders(),
    countProcessedImages(),
  ]);

  return successResponse(c, { uploaders, totalImages });
});

galleryRouter.post(
  "/guests/:id/like",
  requireAuth,
  async (c: SimpleAuthContext) => {
    const { id } = c.req.param();
    const userId = c.get("userId");

    const upload = await db.query.guestUploadsTable.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      columns: { id: true },
    });

    if (!upload) {
      return errorResponse(c, "Upload not found", 404);
    }

    let liked = false;

    await db.transaction(async (tx) => {
      try {
        await tx.insert(guestUploadLikesTable).values({
          uploadId: id,
          userId,
        });

        liked = true;
      } catch {
        await tx
          .delete(guestUploadLikesTable)
          .where(
            and(
              eq(guestUploadLikesTable.uploadId, id),
              eq(guestUploadLikesTable.userId, userId),
            ),
          );

        liked = false;
      }
    });

    const [row] = await db
      .select({ value: count() })
      .from(guestUploadLikesTable)
      .where(eq(guestUploadLikesTable.uploadId, id));

    return successResponse(c, { liked, likesCount: row?.value ?? 0 });
  },
);

galleryRouter.post("newsletter/subscribe", async (c) => {
  const body = await c.req.json();
  const res = newsletterSignSchema.safeParse(body);
  const userId = await getUserId(c);

  if (!res.success) {
    return c.json({ success: false, error: z.treeifyError(res.error) }, 400);
  }

  const { email } = res.data;

  const resend = new Resend(env.RESEND_KEY);

  await db
    .insert(newsletterTable)
    .values({
      email,
      userId,
    })
    .onConflictDoUpdate({
      target: [newsletterTable.email],
      set: {
        updatedAt: new Date(),
      },
    });

  await resend.emails.send({
    to: email,
    from: `Сватбата на Криси и Лъчо <${env.MAIL_ADDRESS_FROM}>`,
    subject: "Благодарим ти за изявение интерес",
    text: "Ще се свържеш с теб веднага, когато снимките от сватбата са готови и са публикувани в сайта.",
  });

  return successResponse(c, "ok");
});

export default galleryRouter;
