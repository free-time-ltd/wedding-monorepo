import { Hono } from "hono";
import { successResponse } from "@/reponses";
import {
  findProcessedImages,
  transformProcessedImageWithFullUrl,
} from "@repo/db/utils";
import { env } from "@/env";

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

export default galleryRouter;
