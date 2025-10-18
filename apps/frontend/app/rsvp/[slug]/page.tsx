"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { ArrowLeft, Heart } from "@repo/ui/icons";
import { use, useState } from "react";
import { RsvpResponse } from "@/store/chatStore";
import { FormValues, RsvpForm } from "@/components/rsvp/form";
import { serializeFormValues } from "@/components/rsvp/utils";

const rsvpPromiseCache = new Map<string, Promise<RsvpResponse>>();

const fetchRsvp = async (rsvpId: string) => {
  const url = new URL(
    `/api/rsvps/${rsvpId}`,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );

  const res = await fetch(url, { cache: "force-cache" });
  const json = await res.json();

  return json?.data;
};

const fetchRsvpCached = (rsvpId: string) => {
  if (!rsvpPromiseCache.has(rsvpId)) {
    rsvpPromiseCache.set(rsvpId, fetchRsvp(rsvpId));
  }

  return rsvpPromiseCache.get(rsvpId)!;
};

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const guestId = params.slug as string;
  const guest = use(fetchRsvpCached(guestId));

  const [submitted, setSubmitted] = useState(false);

  if (!guest) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-rose-gold-600">
              Не успях да открия гост :(
            </CardTitle>
            <CardDescription>
              Не успяхме да открием Вашата покана. Моля проверете линка с
              поканата! Ако мислите, че това е грешка се свържете с младоженците
              за помощ!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = (data: FormData) => {
    const url = new URL(
      `/api/rsvps/${guestId}`,
      process.env.NEXT_PUBLIC_API_BASE_URL
    );

    const payload = Object.fromEntries(data.entries());

    fetch(url, {
      method: "POST",
      body: JSON.stringify(
        serializeFormValues(payload as Record<string, string>)
      ),
      headers: {
        "Content-Type": "application/json",
      },
    }).finally(() => {
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Heart className="h-16 w-16 text-rose-gold-500 fill-rose-gold-500" />
            </div>
            <CardTitle className="text-3xl font-serif text-sage-800">
              Благодарим!
            </CardTitle>
            <CardDescription className="text-lg">
              Получихме вашето потвърждение, {guest.name}. Много се радваме, че
              ще споделите този ден с нас!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/")}
              className="bg-rose-gold-500 hover:bg-rose-gold-600 text-secondary"
            >
              Към началната страница
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-sage-700 hover:text-sage-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Към началната страница
          </Button>
        </div>
      </header>

      {/* RSVP Form */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-sage-800 mb-2">
            Поканени сте!
          </h1>
          <p className="text-xl text-sage-600">Скъпи {guest.name},</p>
          <p className="text-lg text-sage-700 leading-relaxed max-w-2xl mx-auto">
            Ще се чувстваме истински щастливи, ако споделите този момент с нас.
            Моля, потвърдете присъствието си, за да можем да се подготвим и да
            ви посрещнем както подобава.
          </p>
        </div>

        <Card className="border-sage-200">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-sage-800">
              Потвърждение на присъствието
            </CardTitle>
            <CardDescription>
              Моля, споделете с нас отговорите си, за да можем да направим деня
              ни заедно още по-прекрасен.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RsvpForm
              name="rsvp-form"
              defaultValues={guest.invitation as unknown as FormValues}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-sage-600">
          <p>
            Ако е необходимо да актуализирате вашето RSVP по-късно, моля,
            използвайте същата връзка или се свържете директно с нас.
          </p>
        </div>
      </div>
    </div>
  );
}
