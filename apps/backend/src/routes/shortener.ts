import { errorResponse, successResponse } from "@/reponses";
import { eq, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { urlShortenerTable } from "@repo/db/schema";
import { Hono } from "hono";

const shortenerRouter = new Hono();

shortenerRouter.get("/:id", async (c) => {
  const { id: slug } = c.req.param();

  const res = await db.query.urlShortenerTable.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
  });

  console.log({ res });

  if (!res) {
    return errorResponse(c, "URL not found");
  }

  await db
    .update(urlShortenerTable)
    .set({ views: sql`${urlShortenerTable.views} + 1`, updatedAt: new Date() })
    .where(eq(urlShortenerTable.id, res.id));

  return successResponse(c, res);
});

//

export default shortenerRouter;
