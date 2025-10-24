import { successResponse } from "@/reponses";
import { db } from "@repo/db/client";
import { Hono } from "hono";

const galleryRouter = new Hono();

galleryRouter.get("/guests", async (c) => {
  const images = await db.query.guestUploadsTable.findMany({
    where: (table, { notInArray }) =>
      notInArray(table.status, ["processed", "rejected"]),
    with: {
      user: true,
    },
  });
  return successResponse(c, { images });
});

export default galleryRouter;
