import { MapCard } from "@/components/map-card";
import WeatherWidget from "@/components/weather-widget";
import { fetchHotels } from "@/lib/data";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  Calendar,
  Car,
  Clock,
  ExternalLink,
  Mail,
  Phone,
} from "@repo/ui/icons";
import eventData from "@repo/utils/eventData";
import { Metadata } from "next";
import { use } from "react";

export const metadata: Metadata = {
  title: "Локация на сватбата на Кристина и Лъчезар",
  description: "Всичко, което трябва да знаете за нашето сватбено място",
};

export default function VenuePage() {
  const hotels = use(fetchHotels());
  const [lat, lng] = eventData.location.gps;
  const venue = {
    name: eventData.location.venue,
    address:
      "Околовръстен път, на 2 км от кв. Коматево в посока София 4000 Plovdiv, Bulgaria",
    coordinates: { lat, lng },
    phone: "+359898591951",
    email: "colibripoolandgarden@gmail.com",
    description:
      "Очарователен градински комплекс, разположен в полите на Родопите, съчетаващ изискан ресторант, просторна градина и прекрасна гледка към планините. Идеалното място за незабравима сватба под открито небе.",
    parking: "Безплатен паркинг за всички гости на събитието",
    dresscode: "Бихме се радвали, ако изберете официално облекло",
    directionUrl: eventData.location.directionUrl,
    mapsUrl: eventData.location.mapsUrl,
    iframeUrl: eventData.location.iframeUrl,
  };

  const schedule = [
    {
      time: "18:30",
      event: "Пристигане на гостите - welcome drink",
      description:
        "Моля, елате по-рано, за да намерите местата си. Очаква ви малък welcome drink.",
    },
    {
      time: "19:00",
      event: "Начало на церемонията",
      description: "Церемонията ще се проведе в градината",
    },
    {
      time: "19:30",
      event: "Коктейл & Тържество",
      description:
        "Насладете се на напитки и предястия, вечеря, танци и празненство",
    },
    {
      time: "22:30",
      event: "Wedding Cake Moment",
      description: "Разрязване на сватбената торта",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl text-balance text-foreground">
            Място на сватбата
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Всичко, което трябва да знаете за нашето сватбено място
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Map Card */}
          <MapCard {...venue} mapsUrl={venue.directionUrl} />

          {/* Venue Info Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-serif text-xl text-foreground mb-4">
                  Информация за локация
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Телефон
                      </p>
                      <a
                        href={`tel:${venue.phone}`}
                        className="text-sm text-muted-foreground hover:text-accent"
                      >
                        {venue.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Емайл адрес
                      </p>
                      <a
                        href={`mailto:${venue.email}`}
                        className="text-sm text-muted-foreground hover:text-accent"
                      >
                        {venue.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Car className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Паркиране
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {venue.parking}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
                  <a
                    href={venue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Виж в Google Maps
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About Venue */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-2xl text-foreground">
              За локацията
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {venue.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg">
                <Calendar className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Дрескод
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {venue.dresscode}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        <WeatherWidget />

        {/* Schedule */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-accent" />
              <h3 className="font-serif text-2xl text-foreground">
                Програма на събитието
              </h3>
            </div>
            <div className="space-y-4">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="shrink-0 w-24">
                    <p className="text-sm font-medium text-accent">
                      {item.time}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">
                      {item.event}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accommodation Suggestions */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-serif text-2xl text-foreground mb-4">
              Настаняване наблизо
            </h3>
            <p className="text-muted-foreground mb-4">
              За гостите, които пътуват отдалеч, препоръчваме следните хотели,
              разположени в близост до мястото на събитието:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.map((hotel) => (
                <div
                  className="p-4 border border-border rounded-lg"
                  key={`hotel-${hotel.id}`}
                >
                  <p className="font-medium text-foreground mb-1">
                    {hotel.name}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {hotel.distance} от локацията
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={hotel.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Виж детайли
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
