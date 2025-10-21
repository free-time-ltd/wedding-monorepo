export async function fetchOpenMeteoWeather(
  start: string,
  end: string,
  coordinates: [number, number],
  historical: boolean
) {
  const [lat, lon] = [...coordinates];
  const baseUrl = historical
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";

  const url = new URL(baseUrl);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("timezone", "GMT+2");
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "relative_humidity_2m_mean",
      "weathercode",
    ].join(",")
  );

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }

  const data = await res.json();

  return mapWeatherData(data);
}

export interface WeatherDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  precipitation: number;
  humidity: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWeatherData(data: any): WeatherDay[] {
  const result: WeatherDay[] = [];

  const times = data.daily.time as string[];
  const highs = data.daily.temperature_2m_max as number[];
  const lows = data.daily.temperature_2m_min as number[];
  const precip = data.daily.precipitation_sum as number[];
  const humidity = data.daily.relative_humidity_2m_mean as number[];
  const codes = data.daily.weathercode as number[];

  for (let i = 0; i < times.length; i++) {
    result.push({
      date: times[i],
      day: new Date(times[i]).toLocaleDateString("bg-BG", { weekday: "long" }),
      high: highs[i],
      low: lows[i],
      precipitation: precip[i],
      humidity: humidity[i],
      condition: mapWeatherCodeToCondition(codes[i]),
    });
  }

  return result;
}

function mapWeatherCodeToCondition(code: number): WeatherDay["condition"] {
  if ([0, 1].includes(code)) return "sunny";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96].includes(code))
    return "rainy";
  return "partly-cloudy";
}
