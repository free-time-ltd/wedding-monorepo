// const fetchRsvp = async (rsvpId: string) => {
//   const url = new URL(
//     `/api/rsvps/${rsvpId}`,
//     process.env.NEXT_PUBLIC_API_BASE_URL
//   );

//   const res = await fetch(url, { cache: "force-cache" });
//   const json = await res.json();

//   return json?.data;
// };

// export default async function RsvpPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const rsvp = await fetchRsvp(slug);

//   return (
//     <div>
//       <p>Well?</p>
//       <p>{JSON.stringify(rsvp)}</p>
//     </div>
//   );
// }
"use client";

import type React from "react";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { ArrowLeft, Heart } from "@repo/ui/icons";
import { useState } from "react";

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const guestId = params.guestId as string;
  const guest = {
    name: "Lachezar Tsochev",
    plusOne: true,
  };

  const [formData, setFormData] = useState({
    attending: "",
    bringingGuest: "",
    transportation: "",
    accommodation: "",
    dietary: "",
  });

  const [submitted, setSubmitted] = useState(false);

  if (!guest) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-rose-gold-600">
              Guest Not Found
            </CardTitle>
            <CardDescription>
              We couldn't find your invitation. Please check your invitation
              link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would save to a database
    console.log("[v0] RSVP submitted:", { guestId, ...formData });
    setSubmitted(true);
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Question 1: Attending */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-sage-800">
                  Will you be attending?
                </Label>
                <RadioGroup
                  value={formData.attending}
                  onValueChange={(value) =>
                    setFormData({ ...formData, attending: value })
                  }
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="attending-yes" />
                    <Label
                      htmlFor="attending-yes"
                      className="font-normal cursor-pointer"
                    >
                      Yes, I'll be there!
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="attending-no" />
                    <Label
                      htmlFor="attending-no"
                      className="font-normal cursor-pointer"
                    >
                      Unfortunately, I can't make it
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="attending-maybe" />
                    <Label
                      htmlFor="attending-maybe"
                      className="font-normal cursor-pointer"
                    >
                      Not sure yet
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 2: Bringing Guest */}
              {guest.plusOne && (
                <div className="space-y-3">
                  <Label className="text-base font-medium text-sage-800">
                    Will you be bringing a guest?
                  </Label>
                  <RadioGroup
                    value={formData.bringingGuest}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bringingGuest: value })
                    }
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="guest-yes" />
                      <Label
                        htmlFor="guest-yes"
                        className="font-normal cursor-pointer"
                      >
                        Yes, I'll bring a plus one
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="guest-no" />
                      <Label
                        htmlFor="guest-no"
                        className="font-normal cursor-pointer"
                      >
                        No, just me
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Question 3: Transportation */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-sage-800">
                  Will you need transportation or parking?
                </Label>
                <RadioGroup
                  value={formData.transportation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, transportation: value })
                  }
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parking" id="transport-parking" />
                    <Label
                      htmlFor="transport-parking"
                      className="font-normal cursor-pointer"
                    >
                      I'll need parking
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shuttle" id="transport-shuttle" />
                    <Label
                      htmlFor="transport-shuttle"
                      className="font-normal cursor-pointer"
                    >
                      I'd like shuttle service
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="transport-none" />
                    <Label
                      htmlFor="transport-none"
                      className="font-normal cursor-pointer"
                    >
                      No transportation needed
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 4: Accommodation */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-sage-800">
                  Would you like help finding a nearby hotel or guesthouse?
                </Label>
                <RadioGroup
                  value={formData.accommodation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, accommodation: value })
                  }
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="accommodation-yes" />
                    <Label
                      htmlFor="accommodation-yes"
                      className="font-normal cursor-pointer"
                    >
                      Yes, please send recommendations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="accommodation-no" />
                    <Label
                      htmlFor="accommodation-no"
                      className="font-normal cursor-pointer"
                    >
                      No, I have accommodations arranged
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 5: Dietary Restrictions */}
              <div className="space-y-3">
                <Label
                  htmlFor="dietary"
                  className="text-base font-medium text-sage-800"
                >
                  Do you have any allergies or dietary restrictions?
                </Label>
                <Textarea
                  id="dietary"
                  placeholder="Please let us know about any dietary needs, allergies, or food preferences..."
                  value={formData.dietary}
                  onChange={(e) =>
                    setFormData({ ...formData, dietary: e.target.value })
                  }
                  className="min-h-[100px] resize-none"
                />
                <p className="text-sm text-sage-600">
                  We'll do our best to accommodate your dietary needs. Leave
                  blank if you have no restrictions.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-rose-gold-500 hover:bg-rose-gold-600 text-secondary text-lg py-6"
                  disabled={
                    !formData.attending ||
                    !formData.transportation ||
                    !formData.accommodation
                  }
                >
                  Submit RSVP
                </Button>
              </div>
            </form>
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
