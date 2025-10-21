import { Guest } from "@/store/chatStore";
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
