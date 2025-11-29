"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { MapPin, Navigation } from "@repo/ui/icons";
import Link from "next/link";

interface Props {
  name: string;
  address: string;
  mapsUrl: string;
  iframeUrl: string;
}

export function MapCard({ name, address, iframeUrl, mapsUrl }: Props) {
  return (
    <Card className="lg:col-span-2 overflow-hidden p-0">
      <CardContent className="p-0">
        <div className="relative h-96 bg-muted">
          <iframe
            src={iframeUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue Location Map"
          ></iframe>
        </div>
      </CardContent>
      <CardHeader className="p-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-foreground">{name}</h3>
            <p className="text-muted-foreground flex items-start gap-2">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent" />
              <span>{address}</span>
            </p>
          </div>
          <Button type="button" className="shrink-0 w-full md:w-auto" asChild>
            <Link href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4 mr-2" />
              Навигация
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
