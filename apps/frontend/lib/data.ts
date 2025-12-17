import { Guest } from "@/store/chatStore";
import type { UserApiType } from "@repo/db/utils";
import { cache } from "react";

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string | string[] };

export const fetchGuests = cache(async (): Promise<Guest[] | null> => {
  try {
    const url = new URL("/api/users", process.env.NEXT_PUBLIC_API_BASE_URL);
    const res = await fetch(url, {
      cache: "force-cache",
      next: { tags: ["guests"] },
    });
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
  const res = await fetch(url, { next: { tags: ["weather"] } });
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
  createdAt: string;
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
  sort,
  orderBy,
  uploader,
  limit = 20,
}: {
  sort?: string;
  orderBy?: string;
  uploader?: string;
  cursor?: string | null;
  limit?: number;
} = {}) => {
  const searchParams = new URLSearchParams(
    Object.entries({
      sort,
      orderBy,
      uploader,
      cursor,
      limit: limit.toString(),
    }).filter(([, v]) => !!v) as [string, string][]
  );
  const url = new URL(
    `/api/gallery/guests?${searchParams.toString()}`,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );

  try {
    const res = await fetch(url, {
      credentials: "include",
      next: { tags: ["uploads"] },
    });

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

export type Poll = {
  id: string;
  title: string;
  subtitle: string;
  createdAt: Date;
  validUntil: Date;
  options: {
    votes: number;
    id: string;
    title: string;
  }[];
  active: boolean;
  userVote: string;
  totalVotes: number;
};

type PollResponseData = {
  polls: Poll[];
  totalVotes: number;
  userVotes: number;
};

export type PollsResponse = ApiResponse<PollResponseData>;

export const fetchPolls = cache(async () => {
  const url = new URL(`/api/polls`, process.env.NEXT_PUBLIC_API_BASE_URL);

  try {
    const res = await fetch(url, {
      credentials: "include",
      next: { tags: ["polls"] },
    });
    const json = (await res.json()) as PollsResponse;

    if (json.success) {
      return json.data;
    }

    return {
      polls: [],
      totalVotes: 0,
      userVotes: 0,
    };
  } catch (e) {
    console.error(e);
  }
});

type Hotel = {
  id: number;
  name: string;
  websiteUrl: string;
  distance: string;
};

export const fetchHotels = cache(async (): Promise<Hotel[]> => {
  const url = new URL(`/api/hotels`, process.env.NEXT_PUBLIC_API_BASE_URL);

  try {
    const res = await fetch(url, {
      credentials: "include",
      next: { tags: ["hotels"] },
    });
    const json = (await res.json()) as ApiResponse<Hotel[]>;

    if (json.success) {
      return json.data;
    }

    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
});
