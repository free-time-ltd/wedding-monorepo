import { db } from "@repo/db/client";
import { Hono } from "hono";

const hotelsRouter = new Hono();

hotelsRouter.get("/", async (c) => {
  const hotels = await db.query.nearbyHotels.findMany();

  return c.json({ success: true, data: hotels });
});

export default hotelsRouter;
