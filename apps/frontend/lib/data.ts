import { Guest } from "@/store/chatStore";
import type { UserApiType } from "@repo/db/utils";
import { cache } from "react";

export const fetchGuests = cache(async (): Promise<Guest[] | null> => {
  try {
    const url = new URL("/api/users", process.env.NEXT_PUBLIC_API_BASE_URL);
    const res = await fetch(url, { cache: "force-cache" });
    const json = await res.json();
    if (json.success && "data" in json) {
      return json.data as Guest[];
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
});

export interface WeatherDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  precipitation: number;
  humidity: number;
}

export interface WeatherResponse {
  status: boolean;
  data: WeatherDay[];
  daysUntilWedding: number;
  isHistorical: boolean;
  year: string;
}

export const fetchWeather = async (): Promise<WeatherResponse> => {
  const url = new URL("/api/weather", process.env.NEXT_PUBLIC_API_BASE_URL);
  const res = await fetch(url);
  const json = (await res.json()) as WeatherResponse;

  return json;
};

export type ProcessedImageApiType = {
  id: string;
  key: string;
  originalFilename: string | null;
  width: number | null;
  height: number | null;
  images: {
    original: string;
    thumb: string;
    hd: string;
    lq: string;
  };
  message: string | null;
  user: UserApiType;
};

interface UserUploadsResponse {
  success: boolean;
  data: {
    images: ProcessedImageApiType[];
    nextCursor: string | null;
  };
}
export const fetchUserUploads = async ({
  cursor,
  limit = 20,
}: { cursor?: string; limit?: number } = {}) => {
  const searchParams = new URLSearchParams(
    Object.entries({ cursor, limit: limit.toString() }).filter(
      ([, v]) => v !== undefined
    ) as [string, string][]
  );
  const url = new URL(
    `/api/gallery/guests?${searchParams.toString()}`,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );

  try {
    const res = await fetch(url, { credentials: "include" });

    if (!res.ok) {
      throw new Error(`There was a problem fetching the gallery:`);
    }

    const json = (await res.json()) as UserUploadsResponse;

    return json.data;
  } catch (e) {
    console.error(e);
    return { images: [], nextCursor: null };
  }
};
