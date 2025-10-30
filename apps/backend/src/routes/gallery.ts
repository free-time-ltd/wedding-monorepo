import { Hono } from "hono";
import { successResponse } from "@/reponses";
import {
  findProcessedImages,
  transformProcessedImageWithFullUrl,
} from "@repo/db/utils";
import { env } from "@/env";
import { getUserId } from "@/utils";
import { Resend } from "resend";
import { newsletterSignSchema } from "@/types";
import z from "zod";
import { db } from "@repo/db/client";
import { newsletterTable } from "@repo/db/schema";

const galleryRouter = new Hono();

galleryRouter.get("/guests", async (c) => {
  const { cursor, limit = 20 } = c.req.query();

  const images = await findProcessedImages({ cursor, limit: Number(limit) });

  const nextCursor =
    images.length === limit ? images[images.length - 1].id : null;

  return successResponse(c, {
    images: images.map(transformProcessedImageWithFullUrl(env.CDN_DOMAIN)),
    nextCursor,
  });
});

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
