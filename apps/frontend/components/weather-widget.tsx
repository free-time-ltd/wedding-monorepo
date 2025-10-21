"use client";

import { fetchWeather, WeatherDay } from "@/lib/data";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Cloud, CloudRain, Droplets, Sun, Wind } from "@repo/ui/icons";
import { Suspense, use } from "react";

const cachedPromise = fetchWeather();

export function WeatherWidget() {
  const {
    daysUntilWedding,
    data: forecast = [],
    isHistorical,
    year,
  } = use(cachedPromise);

  const getWeatherIcon = (condition: WeatherDay["condition"]) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-8 w-8 text-amber-500" />;
      case "cloudy":
        return <Cloud className="h-8 w-8 text-slate-400" />;
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-400" />;
      case "partly-cloudy":
        return <Cloud className="h-8 w-8 text-slate-300" />;
    }
  };

  const getConditionText = (condition: WeatherDay["condition"]) => {
    switch (condition) {
      case "sunny":
        return "Слънчево";
      case "cloudy":
        return "Облачно";
      case "rainy":
        return "Дъждовно";
      case "partly-cloudy":
        return "Частична облачност";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Wind className="h-6 w-6 text-accent" />
          <h3 className="font-serif text-2xl text-foreground">
            Прогноза на времето
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Планирайте предварително с 5-дневната прогноза за сватбената седмица.{" "}
          {daysUntilWedding > 1 && (
            <span>Остават {daysUntilWedding} дни до сватбата</span>
          )}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-accent/5 rounded-lg border border-border hover:border-accent/30 transition-colors"
            >
              <p className="text-sm font-medium text-foreground mb-1 capitalize">
                {day.day}
              </p>
              <p className="text-xs text-muted-foreground mb-3">{day.date}</p>
              <div className="mb-3">{getWeatherIcon(day.condition)}</div>
              <p className="text-xs text-muted-foreground mb-2">
                {getConditionText(day.condition)}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-foreground">
                  {day.high}°
                </span>
                <span className="text-sm text-muted-foreground">
                  {day.low}°
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Droplets className="h-3 w-3 text-blue-400" />
                <span>{day.precipitation}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-border">
          {isHistorical ? (
            <p className="text-xs text-muted-foreground text-center">
              В момента виждате времето за изминалата <strong>{year}</strong>{" "}
              година защото все още няма актуална прогноза за 27-ми Юни 2026г.
              Очаквайте актуализация най-рано след 12-ти Юни.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Прогнозата за времето се актуализира редовно. Проверявайте отново
              по-близо до датата за най-точна информация.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const WeatherLoader = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Wind className="h-6 w-6 text-accent" />
          <h3 className="font-serif text-2xl text-foreground">
            Прогноза на времето
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Планирайте предварително с 5-дневната прогноза за сватбената седмица
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((id) => (
            <Skeleton
              key={id}
              className="flex flex-col items-center h-52 p-4 bg-accent/5 rounded-lg border border-border hover:border-accent/30 transition-colors"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function WeatherWidgetWrapper() {
  return (
    <Suspense fallback={<WeatherLoader />}>
      <WeatherWidget />
    </Suspense>
  );
}
