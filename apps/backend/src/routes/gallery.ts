import { Hono } from "hono";
import { successResponse } from "@/reponses";
import { findProcessedImages, transformProcessedImage } from "@repo/db/utils";

const galleryRouter = new Hono();

galleryRouter.get("/guests", async (c) => {
  const images = await findProcessedImages();

  return successResponse(c, { images: images.map(transformProcessedImage) });
});

export default galleryRouter;
