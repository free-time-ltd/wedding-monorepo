import { fetchOpenMeteoWeather } from "@/weather";
import Cache from "@repo/db/cache";
import { db } from "@repo/db/client";
import eventData from "@repo/utils/eventData";
import { Hono } from "hono";

const weatherRouter = new Hono();

weatherRouter.get("/", async (c) => {
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

export default weatherRouter;
